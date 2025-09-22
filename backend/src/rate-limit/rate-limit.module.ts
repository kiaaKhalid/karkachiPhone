import { DynamicModule, Module, Provider } from '@nestjs/common';
import {
  RATE_LIMIT_OPTIONS,
  DEFAULT_GLOBAL_POLICY,
  RATE_LIMIT_STORE,
} from './rate-limit.constants';
import {
  RateLimitGlobalOptions,
  RateLimitStore,
} from './rate-limit.interfaces';
import { RateLimitGuard } from './rate-limit.guard';
import { APP_GUARD } from '@nestjs/core';
import { MemoryRateLimitStore } from './store/memory.store';

@Module({})
export class RateLimitModule {
  static forRoot(options: Partial<RateLimitGlobalOptions> = {}): DynamicModule {
    const opts: RateLimitGlobalOptions = {
      ...DEFAULT_GLOBAL_POLICY,
      trustProxy: false,
      ...options,
    };

    const optionsProvider: Provider = {
      provide: RATE_LIMIT_OPTIONS,
      useValue: opts,
    };

    const storeProvider: Provider<RateLimitStore> = {
      provide: RATE_LIMIT_STORE,
      useFactory: () => new MemoryRateLimitStore(),
    };

    const guardProvider: Provider = {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    };

    return {
      module: RateLimitModule,
      providers: [optionsProvider, storeProvider, guardProvider],
      exports: [RATE_LIMIT_OPTIONS, RATE_LIMIT_STORE],
    };
  }
}
