import { Schema, model } from "mongoose";
import { roomTypeList } from "./Room";
import { emailRegexp } from "./User";

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
      type: Date,
      required: [true, "Date check in is required"],
    },
    dateCheckOut: {
      type: Date,
      required: [true, "Date check out is required"],
    },
  },
  { versionKey: false, timestamps: true }
);

const OrderModel = model("Order", orderSchema);

export default OrderModel;
