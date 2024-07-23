import {IsEmail, IsNotEmpty, MinLength} from 'class-validator'

export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string

  @IsNotEmpty()
  @MinLength(6, {message: 'Password must be more than 6 symbols'})
  password: string
}
