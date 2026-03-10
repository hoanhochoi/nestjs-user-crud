import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity'; 
import { AuthGuard } from 'src/common/guards/auth.guard';
import { AuthModule } from 'src/auth/auth.module';
import { Role } from 'src/roles/role.entity';
@Module({
  imports: [TypeOrmModule.forFeature([User, Role]),
   forwardRef(() => AuthModule)
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService] // phải exports để module auth vừa tạo sử dụng hoặc các module khác..
})
export class UsersModule {}
