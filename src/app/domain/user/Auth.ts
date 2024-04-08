import { HTTPResponseLogger } from "app/middlewares/HTTPResponseLogger";
import UserModel from "app/models/User";
import { compareSync, genSaltSync, hashSync } from "bcryptjs";
import { validate } from "class-validator";
import { ApiError } from "helpers/ApiError";
import { ApiResponse } from "helpers/ApiResponse";
import jwt from "jsonwebtoken";
import {
  Authorized,
  Body,
  CurrentUser,
  Get,
  JsonController,
  Post,
  Req,
  UseAfter,
} from "routing-controllers";
import { LoginUserDto, RegisterUserDto } from "./User.dto";
import { CustomRequest, IUserResponse } from "./User.types";

@JsonController("/auth")
export default class Auth {
  private secretKey = process.env.SECRET_KEY || "";

  @Post("/register")
  @UseAfter(HTTPResponseLogger)
  async register(
    @Body() body: RegisterUserDto
  ): Promise<ApiResponse<IUserResponse | {}>> {
    const errors = await validate(body);
    const { name, email, password } = body;

    if (errors.length > 0) {
      console.log("errors => ", errors);
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

    const newUser = await UserModel.create({
      ...body,
      password: hashedPassword,
    });

    const payload = {
      id: newUser._id,
    };

    const token = jwt.sign(payload, this.secretKey, { expiresIn: "23h" });

    await UserModel.findByIdAndUpdate(newUser._id, { token });

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
  async login(
    @Body() body: LoginUserDto
  ): Promise<ApiResponse<IUserResponse | {}>> {
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
      id: existingUser._id,
    };
    const token = jwt.sign(payload, this.secretKey, { expiresIn: "23h" });

    await UserModel.findByIdAndUpdate(
      existingUser._id,
      { token },
      { new: true }
    );

    const userData = {
      token,
      user: {
        name: existingUser.name,
        email: existingUser.email,
        newOrders: existingUser.newOrders.map((order) => ({
          roomName: order.roomName,
          roomType: order.roomType,
          dateCheckIn: order.dateCheckIn,
          dateCheckOut: order.dateCheckOut,
        })),
        oldOrders: existingUser.oldOrders.map((order) => ({
          roomName: order.roomName,
          roomType: order.roomType,
          dateCheckIn: order.dateCheckIn,
          dateCheckOut: order.dateCheckOut,
        })),
      },
    };

    return new ApiResponse(true, userData, "User logged in successfully");
  }

  @Get("/current")
  @UseAfter(HTTPResponseLogger)
  async current(
    @CurrentUser() user: IUserResponse
  ): Promise<ApiResponse<IUserResponse | {}>> {
    const userData = {
      name: user.name,
      email: user.email,
      newOrders: user.newOrders.map((order) => ({
        roomName: order.roomName,
        roomType: order.roomType,
        dateCheckIn: order.dateCheckIn,
        dateCheckOut: order.dateCheckOut,
      })),
      oldOrders: user.oldOrders.map((order) => ({
        roomName: order.roomName,
        roomType: order.roomType,
        dateCheckIn: order.dateCheckIn,
        dateCheckOut: order.dateCheckOut,
      })),
    };

    return new ApiResponse(true, userData, "User data fetched successfully");
  }

  @Post("/logout")
  @Authorized()
  @UseAfter(HTTPResponseLogger)
  async logout(@Req() request: CustomRequest): Promise<ApiResponse<true>> {
    const { id: userId } = request.user;
    await UserModel.findByIdAndUpdate(userId, { token: null });

    return new ApiResponse(true);
  }
}
