import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { BATCH_HANDLERS, BATCH_OPTIONS } from './batch.constants';
import type {
  BatchOptions,
  Job,
  JobHandlersMap,
  JobName,
} from './batch.interfaces';

@Injectable()
export class BatchService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BatchService.name);

  // In-memory queue (scheduled by nextRunAt)
  private queue: Job[] = [];
  private running = false;
  private shuttingDown = false;
  private activeWorkers = 0;
  private timer: NodeJS.Timeout | null = null;

  constructor(
    @Inject(BATCH_OPTIONS) private readonly options: BatchOptions,
    @Inject(BATCH_HANDLERS) private readonly handlers: JobHandlersMap,
  ) {}

  onModuleInit() {
    this.running = true;
    this.scheduleTick(0);
    this.logger.log(
      `BatchService started (concurrency=${this.options.concurrency}, pollIntervalMs=${this.options.pollIntervalMs})`,
    );
  }

  async onModuleDestroy() {
    this.shuttingDown = true;
    if (this.timer) clearTimeout(this.timer);
    // Wait for active workers to finish briefly
    const start = Date.now();
    while (this.activeWorkers > 0 && Date.now() - start < 3000) {
      await new Promise((r) => setTimeout(r, 50));
    }
    this.running = false;
  }

  // Public API to enqueue a job
  enqueue<TPayload = any>(
    name: JobName,
    payload: TPayload,
    opts?: { maxAttempts?: number; delayMs?: number },
  ): string {
    const now = Date.now();
    const job: Job<TPayload> = {
      id: randomUUID(),
      name,
      payload,
      attempts: 0,
      maxAttempts: opts?.maxAttempts ?? this.options.defaultMaxAttempts,
      nextRunAt: now + (opts?.delayMs ?? 0),
      backoffMs: this.options.initialBackoffMs,
    };
    this.push(job);
    return job.id;
  }

  // Internal: push into queue ordered by nextRunAt
  private push(job: Job) {
    this.queue.push(job);
    // Keep small queue sorted; for large queues prefer a proper min-heap
    this.queue.sort((a, b) => a.nextRunAt - b.nextRunAt);
  }

  private scheduleTick(delay: number) {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => void this.tick(), delay);
  }

  private tick() {
    if (!this.running || this.shuttingDown) return;

    // Spawn up to concurrency workers
    while (this.activeWorkers < this.options.concurrency) {
      const job = this.peekReady();
      if (!job) break;
      this.dequeue(job.id);
      this.runJob(job).catch((err) => {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.error(`Worker fatal error: ${msg}`);
      });
    }

    // compute next delay
    const next = this.nextDelayMs();
    this.scheduleTick(next);
  }

  private peekReady(): Job | undefined {
    const now = Date.now();
    return this.queue.find((j) => j.nextRunAt <= now);
  }

  private dequeue(jobId: string) {
    this.queue = this.queue.filter((j) => j.id !== jobId);
  }

  private nextDelayMs(): number {
    if (this.activeWorkers > 0) return 10; // keep workers fed
    const now = Date.now();
    const next = this.queue[0]?.nextRunAt;
    if (!next) return this.options.pollIntervalMs;
    return Math.max(0, Math.min(next - now, this.options.pollIntervalMs));
  }

  private async runJob(job: Job): Promise<void> {
    this.activeWorkers++;
    try {
      const handler = this.handlers[job.name] ?? this.handlers['generic'];
      if (!handler) {
        this.logger.warn(`No handler for job '${job.name}', dropping.`);
        return;
      }
      await handler(job.payload);
      this.logger.log(`Job ${job.id} (${job.name}) done.`);
    } catch (err) {
      job.attempts += 1;
      const canRetry = job.attempts < job.maxAttempts;
      if (canRetry) {
        // Exponential backoff with cap
        job.backoffMs = Math.min(job.backoffMs * 2, this.options.maxBackoffMs);
        job.nextRunAt = Date.now() + job.backoffMs;
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.warn(
          `Job ${job.id} (${job.name}) failed (attempt ${job.attempts}/${job.maxAttempts}). Retry in ${job.backoffMs}ms. Error: ${msg}`,
        );
        this.push(job);
      } else {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.error(
          `Job ${job.id} (${job.name}) exhausted retries (${job.maxAttempts}). Dropping. Error: ${msg}`,
        );
      }
    } finally {
      this.activeWorkers--;
    }
  }
}
