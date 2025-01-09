import { compareSync, genSaltSync, hashSync } from "bcryptjs";
import { validate } from "class-validator";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";
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
import { ApiResponse, ErrorHandler } from "../../../helpers";
import { HTTPResponseLogger } from "../../middlewares/HTTPResponseLogger";
import UserModel from "../../models/User";
import { LoginUserDto, RegisterUserDto } from "./User.dto";
import { CustomRequest, IUserResponse } from "./User.types";

@JsonController("/auth")
export default class Auth {
  private secretKey = process.env.SECRET_KEY || "";

  private async generateUserToken(userId: Types.ObjectId): Promise<string> {
    const payload = { id: userId };
    const token = jwt.sign(payload, this.secretKey, { expiresIn: "23h" });
    await UserModel.findByIdAndUpdate(userId, { token }, { new: true });
    return token;
  }

  private processPassword(
    enteredPassword: string,
    currentPassword?: string
  ): string | boolean {
    if (currentPassword) {
      return compareSync(enteredPassword, currentPassword);
    } else {
      return hashSync(enteredPassword, genSaltSync(10));
    }
  }

  @Post("/register")
  @UseAfter(HTTPResponseLogger)
  async register(
    @Body() body: RegisterUserDto
  ): Promise<ApiResponse<IUserResponse | {}>> {
    const errors = await validate(body);

    if (errors.length > 0) {
      ErrorHandler.throwError(
        400,
        "Validation failed",
        "USER_VALIDATION_FAILED",
        errors
      );
    }

    const { name, email, phone, password } = body;

    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      ErrorHandler.throwError(
        409,
        "User with this email already exists",
        "USER_ALREADY_EXISTS",
        errors
      );
    }

    const hashedPassword = this.processPassword(password);

    const newUser = await UserModel.create({
      ...body,
      password: hashedPassword,
    });

    const token = await this.generateUserToken(newUser._id);

    const userData = {
      token,
      user: {
        name,
        phone,
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

    if (errors.length > 0) {
      ErrorHandler.throwError(
        400,
        "Validation failed",
        "USER_VALIDATION_FAILED",
        errors
      );
    }

    const { email, password } = body;

    const existingUser = await UserModel.findOne({ email });

    if (!existingUser) {
      ErrorHandler.throwError(404, "User not found", "USER_NOT_FOUND", errors);
    }

    const {
      _id,
      name,
      email: userEmail,
      password: existingUserPassword,
      newOrders,
      oldOrders,
    } = existingUser!;

    const isCorrectPassword = this.processPassword(
      password,
      existingUserPassword
    );

    if (!isCorrectPassword) {
      ErrorHandler.throwError(
        400,
        "Incorrect password",
        "INCORRECT_PASSWORD",
        errors
      );
    }

    const token = await this.generateUserToken(_id);

    const userData = {
      token,
      user: {
        name,
        email: userEmail,
        newOrders: newOrders.map((order) => ({
          id: order._id?.toString(),
          roomName: order.roomName,
          roomType: order.roomType,
          dateCheckIn: order.dateCheckIn,
          dateCheckOut: order.dateCheckOut,
        })),
        oldOrders: oldOrders.map((order) => ({
          id: order._id?.toString(),
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
        id: order.id,
        roomName: order.roomName,
        roomType: order.roomType,
        dateCheckIn: order.dateCheckIn,
        dateCheckOut: order.dateCheckOut,
      })),
      oldOrders: user.oldOrders.map((order) => ({
        id: order.id,
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
