import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from 'src/roles/role.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    @InjectRepository(Role)
    private roleRepository: Repository<Role>
  ) { }

  async create(createUserDto: CreateUserDto) {

    //  const existingUser = await this.usersRepository.findOne({
    //   where: {email: createUserDto.email}
    // });
    // if(existingUser){
    //   throw new ConflictException("email đã tồn tại!");
    // }

    // const newUser = this.usersRepository.create(createUserDto);
    // return this.usersRepository.save(newUser);

    try {
      const {role, ...userData} = createUserDto;
      const roles = role && role.length > 0 ? role : ['USER'];

      const roleEntities = await this.roleRepository.find({
        where: roles.map(r => ({name: r}))
      }) //tìm role trong đb

      if (roles.length !== roleEntities.length )
        throw new BadRequestException('Role không tồn tại trong hệ thống!'); // BadRequestException dùng khi dữ liệu truyền vào sai

      const newUser = this.usersRepository.create({
        ...userData,
        roles: roleEntities
      });
      return await this.usersRepository.save(newUser);
    } catch (error) {
      if (error.code === '23505') { // PostgreSQL duplicate key
        throw new ConflictException("email đã tồn tại!");
      }
      throw error;
    }
  }

  async findAll(): Promise<UserResponseDto[]>  {
    let users: User[]  = await this.usersRepository.find();
    if(users.length === 0){
      throw new NotFoundException("không tồn tại user nào!");
    }
    return users.map(user => new UserResponseDto(user.id,user.firstName,user.lastName,user.email,user.isActive,user.roles));
  }

  async findOne(id: number){
    // const user = this.usersRepository.findOneBy(id);

    const user = await this.usersRepository.findOne({ 
      where: { id },
      relations: ['roles']
    });
    if(!user){
      throw new NotFoundException("user không tồn tại!");
    }
    return new UserResponseDto(user.id,user.firstName,user.lastName,user.email,user.isActive,user.roles);
  }


  async findByEmail(email: string) : Promise<User | null>{
    return this.usersRepository.findOne(
      {where: {email},
      relations: ['roles']
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({where:{ id }});
    if(!user){
      throw new NotFoundException("user không tồn tại!");
    }
    // const updatedUser = await this.usersRepository.update(id, updateUserDto);

    const updatedUser = await this.usersRepository.save({
      ...user,
      ...updateUserDto, // key phía sau sẽ ghi dè key phía trước
    })
    return new UserResponseDto(updatedUser.id,updatedUser.firstName,updatedUser.lastName,updatedUser.email,updatedUser.isActive,updatedUser.roles);
  }

  async updateStatus(id: number, updateStatusDto: UpdateStatusDto) {
   const user = await this.usersRepository.findOne({where:{ id }});
    if(!user){
      throw new NotFoundException("user không tồn tại!");
    }
    // const updatedUser = await this.usersRepository.update(id, updateUserDto);

    const updatedUser = await this.usersRepository.save({
      ...user,
      ...updateStatusDto, // key phía sau sẽ ghi dè key phía trước
    })
    return new UserResponseDto(updatedUser.id,updatedUser.firstName,updatedUser.lastName,updatedUser.email,updatedUser.isActive,updatedUser.roles);
  }

  async remove(id: number) {

    const user = await this.usersRepository.findOne({where:{ id }});
    if(!user){
      throw new NotFoundException("user không tồn tại!");
    }
    await this.usersRepository.delete(id);
    return { deleted: true };
  }
}