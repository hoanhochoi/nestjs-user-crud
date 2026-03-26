import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Request,
    UseGuards
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { Public } from 'src/common/decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';
import { ThrottlerMessage } from '../common/decorators/throttler-message.decorator';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('login')
    @Throttle({ default: { limit: 3, ttl: 60000 } }) // ghi đè lên riêng login 3 lần/1p
    @ThrottlerMessage("Bạn đã đăng nhập sai quá 3 lần, tài khoản tạm khóa 1 phút!")
    signIn(@Body() signInDto: Record<string, any>) {
        console.log("userName:"+signInDto.username);
        console.log("password:"+signInDto.password);
        return this.authService.signIn(signInDto.username, signInDto.password);
    }

    @UseGuards(AuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }
}
