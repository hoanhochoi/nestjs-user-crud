import { Role } from "src/roles/role.entity";

export class UserResponseDto{
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    isActive: boolean;
    roles: Role[]

    constructor(id:number, firstName:string, lastName:string,email: string, isActive: boolean, roles: Role[]){
       this.id = id;
       this.firstName = firstName;
       this.lastName = lastName;
       this.email = email;
       this.isActive = isActive;
       this.roles = roles;
    }
}