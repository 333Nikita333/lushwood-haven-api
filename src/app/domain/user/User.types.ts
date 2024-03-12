import { User } from "app/models/User";
import { Request } from "express";

export interface IUser {
  id: string;
  name: string;
  email: string;
  password: string;
}
export interface CustomRequest extends Request {
  user: User;
}