import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from "class-validator";
import { ILoginUser, IRegisterUser } from "./User.types";

export class RegisterUserDto implements Omit<IRegisterUser, "id"> {
  @IsNotEmpty({ message: "Name is required" })
  @IsString()
  name: string;

  @IsNotEmpty({ message: "Email is required" })
  @IsEmail()
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

export class LoginUserDto implements Omit<ILoginUser, "id"> {
  @IsNotEmpty({ message: "Email is required" })
  @IsEmail()
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
