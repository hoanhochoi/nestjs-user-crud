export class UserResponseDto{
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    isActive: boolean;

    constructor(id:number, firstName:string, lastName:string,email: string, isActive: boolean){
       this.id = id;
       this.firstName = firstName;
       this.lastName = lastName;
       this.email = email;
       this.isActive = isActive
    }
}