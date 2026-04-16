
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginThrottlerService } from 'src/common/services/login-throttler.service';
import { UsersService } from '../users/users.service';
import * as bcrypct from 'bcrypt'
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private readonly loginThrottler: LoginThrottlerService
  ) { }

  async signIn(
    username: string,
    pass: string,
    ip: string
  ): Promise<{ access_token: string }> {
    //1. check limit
    await this.loginThrottler.checkLimit(ip, username);

    const user = await this.usersService.findByEmail(username);

    // 2. check user
    const isMatch = user ? await bcrypct.compare(pass,user.password)  : false;
    // const isMatch = user ? user.validationPassword(pass)  : false;

    if (!isMatch || !user ) {
      await this.loginThrottler.increaseFail(ip, username);
      throw new UnauthorizedException("Sai email hoặc password");
    }

    // 3. login thành công thì reset
    await this.loginThrottler.reset(ip, username);

    const payload = {
      sub: user.id,
      username: user.email,
      name: user.firstName,
      // roles: user.roles ,// lấy thêm role

      roles: user.roles.map(role => role.name)
    };

    return {
      // 💡 Here the JWT secret key that's used for signing the payload 
      // is the key that was passsed in the JwtModule
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
