import { HTTPResponseLogger } from "app/middlewares/HTTPResponseLogger";
import UserModel, { User } from "app/models/User";
import { genSaltSync, hashSync } from "bcryptjs";
import { validate } from "class-validator";
import { ApiError } from "helpers/ApiError";
import { ApiResponse } from "helpers/ApiResponse";
import jwt from "jsonwebtoken";
import { Body, JsonController, Post, UseAfter } from "routing-controllers";
import { RegisterUserDto } from "./RegisterUser.dto";
@JsonController("/auth")
export default class Auth {
  private secretKey = process.env.SECRET_KEY || "";

  @Post("/register")
  @UseAfter(HTTPResponseLogger)
  async register(
    @Body() body: RegisterUserDto
  ): Promise<ApiResponse<User | {}>> {
    const errors = await validate(body);
    const { email, password } = body;

    if (errors.length > 0) {
      const errorData = {
        message: "Validation failed",
        code: "USER_VALIDATION_FAILED",
        errors,
      };
      throw new ApiError(400, errorData);
    }

    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      const errorData = {
        message: "User with this email already exists",
        code: "USER_ALREADY_EXISTS",
        errors,
      };
      throw new ApiError(409, errorData);
    }

    const hashedPassword = hashSync(password, genSaltSync(10));
    const payload = {
      email,
    };
    const token = jwt.sign(payload, this.secretKey, { expiresIn: "23h" });
    const newUser = await UserModel.create({
      ...body,
      password: hashedPassword,
      token,
    });

    const userData = {
      token,
      user: {
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar,
      },
    };

    return new ApiResponse(true, userData, "User registered successfully");
  }
}
