export type JobName = 'email.send' | 'orders.export' | 'generic';

export interface Job<TPayload = any> {
  id: string;
  name: JobName;
  payload: TPayload;
  attempts: number;
  maxAttempts: number;
  nextRunAt: number; // epoch ms
  backoffMs: number; // current backoff duration
}

export interface BatchOptions {
  // Number of jobs processed in parallel
  concurrency: number;
  // Max attempts per job
  defaultMaxAttempts: number;
  // Initial backoff in ms (exponential)
  initialBackoffMs: number;
  // Max backoff cap in ms
  maxBackoffMs: number;
  // Polling interval when idle (ms)
  pollIntervalMs: number;
}

export type JobHandler<TPayload = any> = (payload: TPayload) => Promise<void>;

export interface JobHandlersMap {
  [jobName: string]: JobHandler<any>;
}
