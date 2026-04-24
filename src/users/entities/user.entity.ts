// import { Role } from '../../enums/user-role'
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, BeforeInsert, BeforeUpdate } from 'typeorm';
import { Role } from 'src/roles/role.entity';
import * as bcrypt from 'bcrypt';


@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({unique: true})  // email không được trùng lặp ở tầng db
  email: string;

  @Column({nullable: true})
  password: string;

  @BeforeInsert()
  async hashPassword(){
    this.password = await bcrypt.hash(this.password,10);
  }

  @BeforeUpdate()
  async updatePassword(){
    const isAlreadyHashed = this.password.startsWith("$2b$");
    if(!isAlreadyHashed){
      this.password = await bcrypt.hash(this.password,10);
    }
  }

  async validationPassword(password: string): Promise<boolean>{
    return await bcrypt.compare(password,this.password)
  }

  @ManyToMany(()=>  Role, (role)=> role.users)
  @JoinTable({ // chú ý là JoinTable và chỉ 1 bên có thôi
    name: 'user_roles'
  })
  roles: Role[];
}