import { HTTPResponseLogger } from "app/middlewares/HTTPResponseLogger";
import RoomModel, { Room } from "app/models/Room";
import { ApiError } from "helpers/ApiError";
import { ApiResponse } from "helpers/ApiResponse";
import {
  Get,
  JsonController,
  Param,
  QueryParam,
  UseAfter,
} from "routing-controllers";
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

  @Get("/rooms/:name")
  @UseAfter(HTTPResponseLogger)
  async getOne(@Param("name") name: string): Promise<ApiResponse<IRoom>> {
    console.log("name", name);
    try {
      const searchQuery = name
        .toLowerCase()
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      console.log("searchQuery", searchQuery);

      const data = await RoomModel.findOne({ name: searchQuery }).lean();
      console.log("data", data);

      if (!data || data === null) {
        const errorData = {
          message: "Room not found",
          code: "ROOM_NOT_FOUND",
        };
        throw new ApiError(404, errorData);
      }

      const { _id, ...restData } = data;
      const room = {
        id: _id.toString(),
        ...restData,
      };
      console.log("room", room);

      return new ApiResponse(true, room, "Room fetched successfully");
    } catch (error) {
      throw error;
    }
  }
}
