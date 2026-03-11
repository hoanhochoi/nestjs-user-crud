import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateUserDto {

    @IsString()
    @IsNotEmpty({message: "firstName không được để trống!"})
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsNotEmpty()
    @IsEmail({},{ message :'Email không đúng định dạng' })
    email: string;

    @IsString()
    @IsNotEmpty({message: "password không được để trống!"})
    password: string;

    @IsOptional() // có thể là không gửi role
    @IsArray()
    role:string[];
}
