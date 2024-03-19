import { HTTPRequestLogger } from "app/middlewares/HTTPRequestLogger";
import {
  Authorized,
  Get,
  JsonController,
  Req,
  UseAfter,
} from "routing-controllers";
import { CustomRequest } from "../user/User.types";
import { Order } from "app/models/Order";
import { ApiResponse } from "helpers/ApiResponse";

@JsonController("/booking")
export default class Booking {
  @Get("/neworders")
  @Authorized()
  @UseAfter(HTTPRequestLogger)
  async getAllNewOrders(
    @Req() request: CustomRequest
  ): Promise<ApiResponse<Order[]>> {
    const newOrders = request.user.newOrders;

    return new ApiResponse(true, newOrders, "New orders fetched successfully");
  }

  @Get("/oldorders")
  @Authorized()
  @UseAfter(HTTPRequestLogger)
  async getAllOldOrders(
    @Req() request: CustomRequest
  ): Promise<ApiResponse<Order[]>> {
    const oldOrders = request.user.oldOrders;

    return new ApiResponse(true, oldOrders, "Old orders fetched successfully");
  }
}
