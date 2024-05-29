import { Schema, model } from "mongoose";
import { roomTypeList } from "./Room";

export const emailRegexp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const dateRegexp = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;

export const orderSchema = new Schema(
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
      },
      phone: {
        type: String,
        required: [true, "Client phone is required"],
      },
    },
    roomName: {
      type: String,
      required: [true, "Room name is required"],
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

orderSchema.index({ dateCheckOut: 1 }, { expireAfterSeconds: 0 });

const OrderModel = model("Order", orderSchema);

export default OrderModel;
