import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsNotEmptyObject,
  IsPhoneNumber,
  IsString,
  Matches,
  ValidateNested,
} from "class-validator";
import { emailRegexp } from "../../models/Order";
import { IClient, IOrder } from "./Order.types";

class ClientDto implements IClient {
  @IsNotEmpty({ message: "Client name is required" })
  @IsString({ message: "Client name must be a string" })
  name: string;

  @IsNotEmpty({ message: "Client email is required" })
  @IsEmail()
  @IsString({ message: "Client email must be a string" })
  @Matches(emailRegexp, {
    message: "Invalid client email format",
  })
  email: string;

  @IsNotEmpty({ message: "Client phone is required" })
  @IsPhoneNumber()
  phone: string;
}

export class OrderRoomDto implements Omit<IOrder, "id"> {
  @ValidateNested({ each: true })
  @IsNotEmptyObject()
  client: ClientDto;

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
