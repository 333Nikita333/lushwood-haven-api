import {
  IsDate,
  IsDateString,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsNotEmptyObject,
  IsPhoneNumber,
  IsString,
  ValidateNested,
} from "class-validator";
import { IClient, IOrder } from "./Order.types";
import { Transform, Type } from "class-transformer";


class ClientDto implements IClient {
  @IsNotEmpty({ message: "Client name is required" })
  @IsString({ message: "Client name must be a string" })
  name: string;

  @IsNotEmpty({ message: "Client email is required" })
  @IsEmail()
  email: string;

  @IsNotEmpty({ message: "Client phone is required" })
  @IsPhoneNumber()
  phone: string;
}

export class OrderRoomDto implements Omit<IOrder, "id"> {
  @ValidateNested({ each: true })
  @IsNotEmptyObject()
  curClient: ClientDto;

  @IsNotEmpty({ message: "Room name is required" })
  @IsString({ message: "Room name must be a string" })
  roomName: string;

  @IsNotEmpty({ message: "Room type is required" })
  @IsIn(["Standard", "Family", "Suite"], { message: "Invalid room type" })
  roomType: "Standard" | "Family" | "Suite";

  @IsNotEmpty({ message: "Check-in date is required" })
  @IsDate()
  dateCheckIn: Date;

  @IsNotEmpty({ message: "Check-out date is required" })
  @IsDate()
  dateCheckOut: Date;
}
