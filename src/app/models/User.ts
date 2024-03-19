import { Document, Model, Schema, model } from "mongoose";
import { Order } from "./Order";

const emailRegexp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
export interface User extends Document {
  _id: Schema.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  newOrders: Order[];
  oldOrders: Order[];
  token: string | null;
}

const userSchema = new Schema<User>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      match: emailRegexp,
      required: [true, "Email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    newOrders: [
      {
        roomName: {
          type: String,
        },
        roomType: {
          type: String,
        },
        dateCheckIn: {
          type: Date,
        },
        dateCheckOut: {
          type: Date,
        },
      },
    ],
    oldOrders: [
      {
        name: String,
        type: String,
        dateCheckIn: Date,
        dateCheckOut: Date,
      },
    ],
    token: {
      type: String,
      default: null,
    },
  },
  { versionKey: false, timestamps: true }
);

const UserModel: Model<User> = model<User>("User", userSchema);

export default UserModel;
