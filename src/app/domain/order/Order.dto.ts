import {
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

  @IsNotEmpty({ message: "Date check in is required" })
  @IsString()
  dateCheckIn: string;

  @IsNotEmpty({ message: "Date check out is required" })
  @IsString()
  dateCheckOut: string;
}
