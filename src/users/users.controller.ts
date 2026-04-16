import { Controller, Get, Post, Body, Patch,Put, Param, Delete, UseGuards, } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { ResponseData } from 'src/global/globalClass';
import { HttpStatus,HttpMessage } from 'src/global/globalEnum';
import { UserResponseDto } from './dto/user-response.dto';
import { AuthGuard} from 'src/common/guards/auth.guard';

import { Public } from 'src/common/decorators/public.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '../enums/user-role';
import { Ctx, EventPattern, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';

// @UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @EventPattern("create_user")
  handleUserCreated(@Payload() data: any, @Ctx() context: RmqContext){
    // console.log(`Pattern:${context.getPattern()}`);
    console.log("getMessage:",context.getMessage());
    console.log("getChannelRef:",context.getChannelRef());
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    console.log("tôi đã nhận được tin nhắn rabbitmq",data);
    channel.ack(originalMsg); // để xác nhận và xóa trong queue
  }


  @Public()
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    console.log("đây là tạo user")
    const newUser = await this.usersService.create(createUserDto);
    return new ResponseData<UserResponseDto>(newUser,HttpStatus.SUCCESS,HttpMessage.SUCCESS)
  }

  @Roles(Role.Admin, Role.User)
  @Get()
  async findAll(): Promise<ResponseData<UserResponseDto[]>> {
    let users = await this.usersService.findAll();
    return new ResponseData<UserResponseDto[]>(users,HttpStatus.SUCCESS,HttpMessage.SUCCESS);
  }

  @Get(':id')
  async findOne(@Param('id') id: string,): Promise<ResponseData<UserResponseDto>> {
    const user = await this.usersService.findOne(+id);
    return new ResponseData<UserResponseDto>(user,HttpStatus.SUCCESS,HttpMessage.SUCCESS);  // +1 để ép kiểu number vì lấy ở Param là string
  }

  @Roles(Role.Admin)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<ResponseData<UserResponseDto>> {
    const updatedUser =await this.usersService.update(+id,updateUserDto);
    return new ResponseData<UserResponseDto>(updatedUser,HttpStatus.SUCCESS,HttpMessage.SUCCESS);
  }

  @Roles(Role.Editor, Role.Admin)
  @Patch(':id')
  async updateStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateStatusDto) {
    const updatedUser =await this.usersService.updateStatus(+id,updateStatusDto);
    return new ResponseData<UserResponseDto>(updatedUser,HttpStatus.SUCCESS,HttpMessage.SUCCESS);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.usersService.remove(+id)
    return new ResponseData(result,HttpStatus.SUCCESS,HttpMessage.SUCCESS);
  }
}
