import {
  IsAlphanumeric,
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from "class-validator";
import { IUserRequest } from "./User.types";

export class RegisterUserDto implements Omit<IUserRequest, "id"> {
  @IsNotEmpty({ message: "Name is required" })
  @IsString({ message: "Name must be a string" })
  @IsAlphanumeric() // Новое правило проверки типа
  name: string;

  @IsNotEmpty({ message: "Email is required" })
  @IsEmail()
  @IsString({ message: "Email must be a string" })
  @Matches(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, {
    message: "Invalid email format",
  })
  email: string;

  @IsNotEmpty({ message: "Password is required" })
  @IsString()
  @Length(6, 30, {
    message: "Password length must be between 6 and 30 characters",
  })
  password: string;
}

export class LoginUserDto implements Omit<IUserRequest, "id" | "name"> {
  @IsNotEmpty({ message: "Email is required" })
  @IsEmail()
  @IsString({ message: "Email must be a string" })
  @Matches(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, {
    message: "Invalid email format",
  })
  email: string;

  @IsNotEmpty({ message: "Password is required" })
  @IsString()
  @Length(6, 30, {
    message: "Password length must be between 6 and 30 characters",
  })
  password: string;
}
