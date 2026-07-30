import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";
import { Role } from "src/auth/role.enum";

export class CreateUserDto {

    @IsString()   
    readonly name!: string;

    @IsNotEmpty()
    @IsEmail()
    readonly email!: string;

    @IsNotEmpty()
    @MinLength(6)
    readonly password!: string;

    @IsOptional()
    @IsEnum(Role)
    readonly role?: Role;

}
