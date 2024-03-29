import { Schema, model } from "mongoose";

export const roomTypeList = ["Standard", "Family", "Suite"];

const roomSchema = new Schema(
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

const RommModel = model("Room", roomSchema);

export default RommModel;
