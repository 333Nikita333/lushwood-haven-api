import { Document, Model, Schema, model } from "mongoose";

export interface Room extends Document {
  _id: Schema.Types.ObjectId;
  name: string;
  images: string[];
  type: "Standard" | "Family" | "Suite";
  perNight: number;
  description: string;
  amenities: {
    icon: string;
    desc: string;
  }[];
}
export const roomTypeList = ["Standard", "Family", "Suite"];

const roomSchema = new Schema<Room>(
  {
    name: {
      type: String,
      unique: true,
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
