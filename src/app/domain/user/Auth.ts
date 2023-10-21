import {
  JsonController,
  Post,
  Body,
  BadRequestError,
} from "routing-controllers";
import { RegisterUserDto } from "./RegisterUser.dto";
import UserModel from "app/models/User";

@JsonController("/auth")
export default class Auth {
  @Post("/register")
  async register(@Body() body: RegisterUserDto) {
    const { name, email, password } = body;

    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      throw new BadRequestError("User with this email already exists");
    }

    const newUser = new UserModel({
      name,
      email,
      password,
    });
    await newUser.save();

    return { success: true, message: "User registered successfully" };
  }
}
