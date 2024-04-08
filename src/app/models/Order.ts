import { Schema, model } from "mongoose";
import { roomTypeList } from "./Room";
import { emailRegexp } from "./User";

export const dateRegexp = [
  /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/,
  "({VALUE}) is not a valid date format. Date format must be 'YYYY-MM-DD HH:MM'",
];

const orderSchema = new Schema(
  {
    client: {
      name: {
        type: String,
        required: [true, "Client name is required"],
      },
      email: {
        type: String,
        match: emailRegexp,
        required: [true, "Client email is required"],
        unique: true,
      },
      phone: {
        type: String,
        required: [true, "Client phone is required"],
      },
    },
    roomName: {
      type: String,
      required: [true, "Room name is required"],
      unique: true,
    },
    roomType: {
      type: String,
      required: [true, "Room type is required"],
      enum: roomTypeList,
    },
    dateCheckIn: {
      type: String,
      match: dateRegexp,
      required: [true, "Date check in is required"],
    },
    dateCheckOut: {
      type: String,
      match: dateRegexp,
      required: [true, "Date check out is required"],
    },
  },
  { versionKey: false, timestamps: true }
);

const OrderModel = model("Order", orderSchema);

export default OrderModel;
