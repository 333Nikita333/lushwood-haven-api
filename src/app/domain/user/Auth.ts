import { HTTPResponseLogger } from "app/middlewares/HTTPResponseLogger";
import UserModel, { User } from "app/models/User";
import { compareSync, genSaltSync, hashSync } from "bcryptjs";
import { validate } from "class-validator";
import { ApiError } from "helpers/ApiError";
import { ApiResponse } from "helpers/ApiResponse";
import jwt from "jsonwebtoken";
import { Body, JsonController, Post, UseAfter } from "routing-controllers";
import { LoginUserDto, RegisterUserDto } from "./User.dto";

@JsonController("/auth")
export default class Auth {
  private secretKey = process.env.SECRET_KEY || "";

  @Post("/register")
  @UseAfter(HTTPResponseLogger)
  async register(
    @Body() body: RegisterUserDto
  ): Promise<ApiResponse<User | {}>> {
    const errors = await validate(body);
    const { name, email, password } = body;

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
    await UserModel.create({
      ...body,
      password: hashedPassword,
      token,
    });

    const userData = {
      token,
      user: {
        name,
        email,
      },
    };

    return new ApiResponse(true, userData, "User registered successfully");
  }

  @Post("/login")
  @UseAfter(HTTPResponseLogger)
  async login(@Body() body: LoginUserDto): Promise<ApiResponse<User | {}>> {
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

    if (!existingUser) {
      const errorData = {
        message: "User not found",
        code: "USER_NOT_FOUND",
        errors,
      };
      throw new ApiError(404, errorData);
    }

    const passwordCompare = compareSync(password, existingUser.password);

    if (!passwordCompare) {
      const errorData = {
        message: "Incorrect password",
        code: "INCORRECT_PASSWORD",
        errors,
      };
      throw new ApiError(400, errorData);
    }

    const payload = {
      email: existingUser.email,
    };
    const token = jwt.sign(payload, this.secretKey, { expiresIn: "23h" });
    const userData = {
      token,
      user: {
        name: existingUser.name,
        email: existingUser.email,
      },
    };
    return new ApiResponse(true, userData, "User logged in successfully");
  }
}
