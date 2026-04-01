// src/common/services/login-throttler.service.ts
import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class LoginThrottlerService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  private MAX_ATTEMPTS = 3;
  private TTL = 300; // 5 phút

  async checkLimit(ip: string, email: string) {
    const ipKey = `login:fail:ip:${ip}`;
    const emailKey = `login:fail:email:${email}`;
    const ipEmailKey = `login:fail:ip_email:${ip}:${email}`;

    const [ipCount, emailCount, ipEmailCount] = await Promise.all([
      this.redis.get(ipKey),
      this.redis.get(emailKey),
      this.redis.get(ipEmailKey),
    ]);
    console.log(ipKey);
    console.log(emailCount);
    console.log(ipEmailCount)
    if (
      Number(ipCount) >= 10 ||      // IP limit
      Number(emailCount) >= 5 ||   // Email limit
      Number(ipEmailCount) >= this.MAX_ATTEMPTS // IP+Email limit
    ) {
      throw new ForbiddenException('Too many login attempts');
    }
  }

  async increaseFail(ip: string, email: string) {
    const ipKey = `login:fail:ip:${ip}`;
    const emailKey = `login:fail:email:${email}`;
    const ipEmailKey = `login:fail:ip_email:${ip}:${email}`;

    const keys = [ipKey, emailKey, ipEmailKey];

    await Promise.all(
      keys.map(async (key) => {
        const count = await this.redis.incr(key);

        if (count === 1) {
          await this.redis.expire(key, this.TTL);
        }
      }),
    );
  }

  async reset(ip: string, email: string) {
    const ipEmailKey = `login:fail:ip_email:${ip}:${email}`;

    await this.redis.del(ipEmailKey);
  }
}