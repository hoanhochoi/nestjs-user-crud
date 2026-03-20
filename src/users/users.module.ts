import { forwardRef, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { RabbitmqModule } from 'src/rabbitmq/rabbitmq.module';
import { Role } from 'src/roles/role.entity';
import { User } from './entities/user.entity';
@Module({
  imports: [TypeOrmModule.forFeature([User, Role]),
  forwardRef(() => AuthModule),
    RabbitmqModule
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService] // phải exports để module auth vừa tạo sử dụng hoặc các module khác..
})
export class UsersModule { }
