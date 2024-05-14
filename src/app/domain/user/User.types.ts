import { Request } from "express";
import { ClientOrder } from "../order/Order.types";

export interface IUserRequest {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password: string;
}

export interface IUserResponse extends Omit<IUserRequest, "password"> {
  newOrders: ClientOrder[];
  oldOrders: ClientOrder[];
}

export interface CustomRequest extends Request {
  user: IUserResponse;
}
