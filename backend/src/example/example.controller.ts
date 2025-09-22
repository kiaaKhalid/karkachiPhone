import { Controller, Get, Post } from '@nestjs/common';
import { RateLimit } from '../rate-limit/rate-limit.decorator';

@Controller('example')
export class ExampleController {
  @Get('browse')
  browse() {
    return { ok: true, action: 'browse' };
  }

  @Post('login')
  @RateLimit({
    keyStrategy: 'ip_ua',
    refillRatePerSec: 0.333,
    burstCapacity: 5,
  })
  login() {
    return { ok: true, action: 'login' };
  }

  @Post('cart/add')
  @RateLimit({
    keyStrategy: 'user',
    refillRatePerSec: 1,
    burstCapacity: 30,
  })
  addToCart() {
    return { ok: true, action: 'cart_add' };
  }

  @Post('payment/checkout')
  @RateLimit({
    keyStrategy: 'user',
    refillRatePerSec: 0.1,
    burstCapacity: 3,
  })
  checkout() {
    return { ok: true, action: 'checkout' };
  }
}
