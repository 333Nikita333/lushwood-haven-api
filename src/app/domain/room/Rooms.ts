import { HTTPResponseLogger } from "app/middlewares/HTTPResponseLogger";
import RoomModel from "app/models/Room";
import { ApiError } from "helpers/ApiError";
import { ApiResponse } from "helpers/ApiResponse";
import { Get, JsonController, Param, UseAfter } from "routing-controllers";
import { IRoom } from "./Rooms.types";

@JsonController("/services")
export default class Rooms {
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
      amenities: room.amenities.map((item) => ({
        icon: item.icon || "",
        desc: item.desc || "",
      })),
    }));

    return new ApiResponse(true, rooms, "Rooms fetched successfully");
  }

  @Get("/rooms/:name")
  @UseAfter(HTTPResponseLogger)
  async getOne(@Param("name") name: string): Promise<ApiResponse<IRoom>> {
    try {
      const searchQuery = name
        .toLowerCase()
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

      const data = await RoomModel.findOne({ name: searchQuery }).lean();

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
        amenities: data.amenities.map((item) => ({
          icon: item.icon || "",
          desc: item.desc || "",
        })),
      };

      return new ApiResponse(true, room, "Room fetched successfully");
    } catch (error) {
      throw error;
    }
  }
}
