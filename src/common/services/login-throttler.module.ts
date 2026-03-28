import { Module } from "@nestjs/common";
import { RedisModule } from "src/redis/redis.module";
import { LoginThrottlerService } from "./login-throttler.service";

@Module({
    imports: [RedisModule],
    providers: [LoginThrottlerService],
    exports: [LoginThrottlerService],
})

export class LoginThrottlerModule{}