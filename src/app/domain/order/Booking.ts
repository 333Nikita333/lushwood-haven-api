import { HTTPRequestLogger } from "app/middlewares/HTTPRequestLogger";
import OrderModel from "app/models/Order";
import RoomModel from "app/models/Room";
import UserModel from "app/models/User";
import { validate } from "class-validator";
import { ApiResponse, DateValidator, ErrorHandler } from "helpers";
import {
  Authorized,
  Body,
  Delete,
  Get,
  JsonController,
  Param,
  Post,
  Req,
  UseAfter,
} from "routing-controllers";
import { CustomRequest } from "../user/User.types";
import { OrderRoomDto } from "./Order.dto";
import { ClientOrder } from "./Order.types";
import { isValidObjectId } from "mongoose";

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
      ErrorHandler.throwError(
        400,
        "Validation failed",
        "ORDER_VALIDATION_FAILED",
        errors
      );
    }

    const { client, roomName, roomType, dateCheckIn, dateCheckOut } = body;

    const existingRoom = await RoomModel.findOne({ name: roomName });
    if (!existingRoom) {
      ErrorHandler.throwError(
        404,
        "Room with this name not found",
        "ROOM_NOT_FOUND",
        errors
      );
    }

    try {
      DateValidator.validateDateFormat(dateCheckIn);
      DateValidator.validateDateFormat(dateCheckOut);
      DateValidator.validateDateNotInPast(dateCheckIn);
      DateValidator.validateCheckInBeforeCheckOut(dateCheckIn, dateCheckOut);
    } catch (error) {
      ErrorHandler.throwError(
        400,
        error.message,
        "INVALID_DATE_FORMAT",
        errors
      );
    }

    const existingOrder = await OrderModel.findOne({ roomName });
    if (existingOrder) {
      ErrorHandler.throwError(
        409,
        "Order with this room already exists",
        "ORDER_ALREADY_EXISTS",
        errors
      );
    }

    const existingUser = await UserModel.findOne({ email: client.email });

    if (!existingUser) {
      ErrorHandler.throwError(
        404,
        "User not found with this email",
        "USER_NOT_FOUND",
        errors
      );
    }

    const newUserOrder = await OrderModel.create({
      client,
      roomName,
      roomType,
      dateCheckIn,
      dateCheckOut,
    });

    const userOrderData = {
      id: newUserOrder._id.toString(),
      roomName,
      roomType,
      dateCheckIn,
      dateCheckOut,
    };

    await UserModel.findOneAndUpdate(
      { email: existingUser!.email },
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

  @Delete("/cancel/:orderId")
  @Authorized()
  @UseAfter(HTTPRequestLogger)
  async cancelOrder(
    @Param("orderId") orderId: string
  ): Promise<ApiResponse<true>> {
    console.log("orderId => ", typeof orderId);

    if (!isValidObjectId(orderId)) {
      ErrorHandler.throwError(
        400,
        `Order id ${orderId} is invalid`,
        "INVALID_ORDER_ID"
      );
    }

    const deletedOrder = await OrderModel.findByIdAndRemove(orderId);
    console.log("deletedOrder => ", deletedOrder);

    if (!deletedOrder) {
      ErrorHandler.throwError(404, "Order not found", "ORDER_NOT_FOUND");
    }

    return new ApiResponse(true);
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
