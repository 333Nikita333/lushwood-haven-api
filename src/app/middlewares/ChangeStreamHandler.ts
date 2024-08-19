import mongoose from "mongoose";
import { ErrorHandler } from "../../helpers";
import UserModel from "../models/User";

class ChangeStreamHandler {
  private static instance: ChangeStreamHandler;

  private constructor() {}

  public static getInstance(): ChangeStreamHandler {
    if (!ChangeStreamHandler.instance) {
      ChangeStreamHandler.instance = new ChangeStreamHandler();
    }
    return ChangeStreamHandler.instance;
  }

  public watchOrderChanges(): void {
    const orderCollection = mongoose.connection.collection("orders");
    const changeStream = orderCollection.watch();

    changeStream.on("change", async (change) => {
      console.log("Change detected:", change);

      if (change.operationType === "delete") {
        const { documentKey } = change;
        const orderId = documentKey._id.toString();

        try {
          const user = await UserModel.findOne({ "newOrders._id": orderId });

          if (!user) {
            return ErrorHandler.throwError(
              404,
              "User not found for the deleted order",
              "USER_NOT_FOUND"
            );
          }

          const orderIndex = user.newOrders.findIndex(
            (order) => order._id!.toString() === orderId
          );

          if (orderIndex === -1) {
            return ErrorHandler.throwError(
              404,
              "Order not found in newOrders",
              "ORDER_NOT_FOUND"
            );
          }

          const { _id, roomName, roomType, dateCheckIn, dateCheckOut } =
            user.newOrders[orderIndex];

          user.newOrders.splice(orderIndex, 1);
          user.oldOrders.push({
            _id,
            roomName,
            roomType,
            dateCheckIn,
            dateCheckOut,
          });

          await user.save();
          console.log(
            "Order moved from newOrders to oldOrders for user:",
            user.email
          );
        } catch (error) {
          console.error("Error:", error);
        }
      }
    });

    changeStream.on("error", (error) => {
      console.error("Error in change stream:", error);
    });

    changeStream.on("end", () => {
      console.log("Change stream closed.");
    });
  }
}

export default ChangeStreamHandler;
