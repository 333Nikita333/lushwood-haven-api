import { Schema, model } from "mongoose";
import { roomTypeList } from "./Room";

export interface Order {
  _id: Schema.Types.ObjectId;
  roomName: string;
  roomType: "Standard" | "Family" | "Suite";
  dateCheckIn: Date;
  dateCheckOut: Date;
}

const orderSchema = new Schema<Order>(
  {
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

const OrderModel = model<Order>("Order", orderSchema);
export default OrderModel;
