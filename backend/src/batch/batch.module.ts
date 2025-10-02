import { DynamicModule, Module, Provider } from '@nestjs/common';
import { BatchService } from './batch.service';
import { BATCH_HANDLERS, BATCH_OPTIONS } from './batch.constants';
import type { BatchOptions, JobHandlersMap } from './batch.interfaces';

const DEFAULT_OPTIONS: BatchOptions = {
  concurrency: 2,
  defaultMaxAttempts: 5,
  initialBackoffMs: 500,
  maxBackoffMs: 30_000,
  pollIntervalMs: 1_000,
};

const DEFAULT_HANDLERS: JobHandlersMap = {
  generic: () => Promise.resolve(),
};

@Module({})
export class BatchModule {
  static forRoot(
    options: Partial<BatchOptions> = {},
    handlers: JobHandlersMap = DEFAULT_HANDLERS,
  ): DynamicModule {
    const opts: BatchOptions = { ...DEFAULT_OPTIONS, ...options };

    const optionsProvider: Provider = {
      provide: BATCH_OPTIONS,
      useValue: opts,
    };

    const handlersProvider: Provider = {
      provide: BATCH_HANDLERS,
      useValue: handlers,
    };

    return {
      module: BatchModule,
      providers: [optionsProvider, handlersProvider, BatchService],
      exports: [BatchService],
    };
  }
}
