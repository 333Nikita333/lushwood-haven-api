import { HTTPResponseLogger } from "app/middlewares/HTTPResponseLogger";
import RoomModel, { Room } from "app/models/Room";
import { ApiError } from "helpers/ApiError";
import { ApiResponse } from "helpers/ApiResponse";
import { Get, JsonController, UseAfter } from "routing-controllers";
import { IRoom } from "./Rooms.types";

@JsonController("/services")
export default class Booking {
  @Get("/rooms")
  @UseAfter(HTTPResponseLogger)
  async getRooms(): Promise<ApiResponse<IRoom[]>> {
    const data = await RoomModel.find().lean({ _id: 1 });

    if (!data || data.length === 0) {
      const errorData = {
        message: "Rooms not found",
        code: "ROOMS_NOT_FOUND",
      };
      throw new ApiError(404, errorData);
    }

    const rooms = data.map(({ _id, ...room }) => ({
      id: _id.toString(),
      ...room,
    }));

    return new ApiResponse(true, rooms, "Rooms fetched successfully");
  }
}
