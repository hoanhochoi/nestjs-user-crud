
import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';
import { THROTTLER_MESSAGE_KEY } from '../decorators/throttler-message.decorator';

@Injectable()
export class ThrottlerCustomGuard extends ThrottlerGuard {
    // logic lấy đúng IP từ Proxy
    protected async getTracker(req: Record<string, any>): Promise<string> {
        return req.ips.length ? req.ips[0] : req.ip; // individualize IP extraction to meet your own needs
    }

    // login hiển thị lỗi bằng tiếng việt
    protected async throwThrottlingException(context: ExecutionContext): Promise<void> {
        // Đọc message từ decorator @ThrottlerMessage
        const customMessage = this.reflector.get<string>(
            THROTTLER_MESSAGE_KEY,
            context.getHandler(),
        );

        throw new ThrottlerException(customMessage || 'Thao tác quá nhanh, vui lòng thử lại sau!');
    }
}