import { IsNotEmpty, IsString } from "class-validator";

export class CreateDomainDto {
    @IsString()
    @IsNotEmpty({message: "domain không được để trống"})
    domain: string;

    @IsString()
    description: string;

}
