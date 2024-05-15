import { HTTPRequestLogger } from "app/middlewares/HTTPRequestLogger";
import OrderModel from "app/models/Order";
import RoomModel from "app/models/Room";
import UserModel from "app/models/User";
import { validate } from "class-validator";
import { ApiError } from "helpers/ApiError";
import { ApiResponse } from "helpers/ApiResponse";
import {
  Authorized,
  Body,
  Get,
  JsonController,
  Post,
  Req,
  UseAfter,
} from "routing-controllers";
import { CustomRequest } from "../user/User.types";
import { OrderRoomDto } from "./Order.dto";
import { ClientOrder } from "./Order.types";

@JsonController("/booking")
export default class Booking {
  @Post("/reserve")
  @Authorized()
  @UseAfter(HTTPRequestLogger)
  async createNewOrder(
    @Body() body: OrderRoomDto
  ): Promise<ApiResponse<ClientOrder | {}>> {
    const errors = await validate(body);

    if (errors.length > 0) {
      const errorData = {
        message: "Validation failed",
        code: "ORDER_VALIDATION_FAILED",
        errors,
      };
      throw new ApiError(400, errorData);
    }

    const { client, roomName, roomType, dateCheckIn, dateCheckOut } = body;

    const existingRoom = await RoomModel.findOne({ name: roomName });
    if (!existingRoom) {
      const errorData = {
        message: "Room with this name not found",
        code: "ROOM_NOT_FOUND",
        errors,
      };
      throw new ApiError(404, errorData);
    }

    if (new Date(dateCheckIn) >= new Date(dateCheckOut)) {
      const errorData = {
        message: "Date check in must be before date check out",
        code: "DATE_CHECK_IN_MUST_BE_BEFORE_DATE_CHECK_OUT",
        errors,
      };
      throw new ApiError(400, errorData);
    }

    const existingOrder = await OrderModel.findOne({ roomName });
    if (existingOrder) {
      const errorData = {
        message: "Order with this room already exists",
        code: "ORDER_ALREADY_EXISTS",
        errors,
      };
      throw new ApiError(409, errorData);
    }

    const existingUser = await UserModel.findOne({ email: client.email });

    if (!existingUser) {
      const errorData = {
        message: "User not found with this email",
        code: "USER_NOT_FOUND",
        errors,
      };
      throw new ApiError(404, errorData);
    }

    await OrderModel.create({
      client,
      roomName,
      roomType,
      dateCheckIn,
      dateCheckOut,
    });

    const userOrderData = {
      roomName,
      roomType,
      dateCheckIn,
      dateCheckOut,
    };

    await UserModel.findOneAndUpdate(
      { email: existingUser.email },
      { $push: { newOrders: userOrderData } }
    );

    const orderData = {
      order: {
        userName: client.name,
        roomName,
        roomType,
        dateCheckIn,
        dateCheckOut,
      },
    };

    return new ApiResponse(true, orderData, "Order created successfully");
  }

  @Get("/neworders")
  @Authorized()
  @UseAfter(HTTPRequestLogger)
  async getAllNewOrders(
    @Req() request: CustomRequest
  ): Promise<ApiResponse<ClientOrder[]>> {
    const newOrders = request.user.newOrders.map(
      ({ id, roomName, roomType, dateCheckIn, dateCheckOut }) => ({
        id,
        roomName,
        roomType,
        dateCheckIn,
        dateCheckOut,
      })
    );

    return new ApiResponse(true, newOrders, "New orders fetched successfully");
  }

  @Get("/oldorders")
  @Authorized()
  @UseAfter(HTTPRequestLogger)
  async getAllOldOrders(
    @Req() request: CustomRequest
  ): Promise<ApiResponse<ClientOrder[]>> {
    const oldOrders = request.user.oldOrders.map(
      ({ id, roomName, roomType, dateCheckIn, dateCheckOut }) => ({
        id,
        roomName,
        roomType,
        dateCheckIn,
        dateCheckOut,
      })
    );

    return new ApiResponse(true, oldOrders, "Old orders fetched successfully");
  }
}
