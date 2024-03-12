import { Document, Model, Schema, model } from "mongoose";

export interface Room extends Document {
  _id: Object;
  name: string;
  images: string[];
  type: "Standart" | "Family" | "Suite";
  perNight: number;
  description: string;
  amenities: { icon: string; desc: string }[];
}
const roomTypeList = ["Standart", "Family", "Suite"];

const roomSchema = new Schema<Room>(
  {
    name: {
      type: String,
    },
    images: {
      type: [String],
    },
    type: {
      type: String,
      enum: roomTypeList,
    },
    perNight: {
      type: Number,
    },
    description: {
      type: String,
    },
    amenities: [
      {
        icon: {
          type: String,
        },
        desc: {
          type: String,
        },
      },
    ],
  },
  { versionKey: false, timestamps: false }
);

const RommModel: Model<Room> = model<Room>("Room", roomSchema);

export default RommModel;
