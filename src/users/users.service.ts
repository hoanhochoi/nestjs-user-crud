import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from 'src/roles/role.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { type Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';
import { ClientProxy, RmqRecordBuilder } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    @InjectRepository(Role)
    private roleRepository: Repository<Role>,

    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,

    @Inject('RABBITMQ_SERVICE')
    private readonly client: ClientProxy,
  ) { }

  async create(createUserDto: CreateUserDto) {
    try {
      // 1. logic lưu user vào postgres
      const { role, password, ...userData } = createUserDto;
      const roles = role && role.length > 0 ? role : ['USER'];

      const roleEntities = await this.roleRepository.find({
        where: roles.map(r => ({ name: r }))
      }) //tìm role trong đb

      if (roles.length !== roleEntities.length)
        throw new BadRequestException('Role không tồn tại trong hệ thống!'); // BadRequestException dùng khi dữ liệu truyền vào sai

      const hashPassword = await bcrypt.hash(password, 10);
    

      const newUser = await this.usersRepository.create({
        ...userData,
        roles: roleEntities,
        password: hashPassword,
      });
      const userResponse = await this.usersRepository.save(newUser)
      // 2. chuẩn bị tin nhắn để gửi san Microservice khác
      const message = { email: newUser.email, userName: newUser.firstName };
      const record = new RmqRecordBuilder(message)
        .setOptions({
          headers: {
            ['x-version']: '1.0.0',
          },
          priority: 3,
        })
        .build();
      // 3. Gửi tin nhắn
      // Dùng .send() nếu muốn đợi phản hồi ("rabbitmq" từ controller kia)
      // Dùng .emit() nếu chỉ muốn gửi đi và mặc kệ kết quả
      try {
        this.client.emit ('create_user', record) // dùng emit không cần .subcribe
        // .subscribe(result => {
        // console.log("phản hồi từ microservice:" + result);
      // }
    // );
      } catch (error) {
        console.log("không nhận được phản hồi từ microservice:" + error.message);
      }

      return userResponse;
    } catch (error) {
      if (error.code === '23505') { // PostgreSQL duplicate key
        throw new ConflictException("email đã tồn tại!");
      }
      throw error;
    }
  }

  async findAll(): Promise<UserResponseDto[]> {
    let users: User[] = await this.usersRepository.find();
    if (users.length === 0) {
      throw new NotFoundException("không tồn tại user nào!");
    }
    return users.map(user => new UserResponseDto(user.id, user.firstName, user.lastName, user.email, user.isActive, user.roles));
  }

  async findOne(id: number) {
    // kiểm tra cache trước
    const cacheKey = `user_${id}`;
    const cachedUser = await this.cacheManager.get<UserResponseDto>(cacheKey);

    if (cachedUser) {
      console.log("đã có thì chạy vào đây")
      console.log(` cache hit: ${cacheKey}`); // báo cache hit
      return cachedUser;
    }
    console.log("chưa có thì chạy vào đây");
    console.log(`cache mist: ${cacheKey}`)
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['roles']
    });
    if (!user) {
      throw new NotFoundException("user không tồn tại!");
    }
    const userResponse = new UserResponseDto(
      user.id,
      user.firstName,
      user.lastName,
      user.email,
      user.isActive,
      user.roles,
    );
    // Lưu vào cache (TTL 600 giây)
    await this.cacheManager.set(cacheKey, userResponse, 600000); // ms
    return userResponse;
  }


  async findByEmail(email: string): Promise<User | null> {
    const cacheKey = `user_email_${email}`;
    const cachedUser = await this.cacheManager.get<User>(cacheKey);
    if (cachedUser)
      return cachedUser;
    const userResponse = await this.usersRepository.findOne(
      {
        where: { email },
        relations: ['roles']
      });
    await this.cacheManager.set(cacheKey, userResponse, 600000);

    return userResponse;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException("user không tồn tại!");
    }
    // const updatedUser = await this.usersRepository.update(id, updateUserDto);

    const updatedUser = await this.usersRepository.save({
      ...user,
      ...updateUserDto, // key phía sau sẽ ghi dè key phía trước
    })

    const userResponse = new UserResponseDto(updatedUser.id, updatedUser.firstName, updatedUser.lastName, updatedUser.email, updatedUser.isActive, updatedUser.roles)

    // xóa cache cũ khi updated
    // await this.cacheManager.del(`user_${id}`)

    // hoặc set lại cache mới 
    await this.cacheManager.set(`user_${id}`, userResponse, 600000); // ms
    return userResponse;
  }

  async updateStatus(id: number, updateStatusDto: UpdateStatusDto) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException("user không tồn tại!");
    }
    // const updatedUser = await this.usersRepository.update(id, updateUserDto);

    const updatedUser = await this.usersRepository.save({
      ...user,
      ...updateStatusDto, // key phía sau sẽ ghi dè key phía trước
    })
    return new UserResponseDto(updatedUser.id, updatedUser.firstName, updatedUser.lastName, updatedUser.email, updatedUser.isActive, updatedUser.roles);
  }

  async remove(id: number) {

    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException("user không tồn tại!");
    }
    await this.usersRepository.delete(id);
    // xóa cache khi xóa user
    await this.cacheManager.del(`user_${id}`)
    return { deleted: true };
  }
}