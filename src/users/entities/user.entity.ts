import { Role } from '../../enums/user-role'
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

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

  @Column({
      type: 'enum',
      enum: Role,
      default: Role.User
    })
  roles: Role;
}