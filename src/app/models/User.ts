import { Schema, model } from "mongoose";
import { dateRegexp } from "./Order";

export const emailRegexp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

const userSchema = new Schema(
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
    phone: {
      type: String,
      default: null,
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
          type: String,
          match: dateRegexp,
        },
        dateCheckOut: {
          type: String,
          match: dateRegexp,
        },
      },
    ],
    oldOrders: [
      {
        roomName: {
          type: String,
        },
        roomType: {
          type: String,
        },
        dateCheckIn: {
          type: String,
          match: dateRegexp,
        },
        dateCheckOut: {
          type: String,
          match: dateRegexp,
        },
      },
    ],
    token: {
      type: String,
      default: null,
    },
  },
  { versionKey: false, timestamps: true }
);

const UserModel = model("User", userSchema);

export default UserModel;
