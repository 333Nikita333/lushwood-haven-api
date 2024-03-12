import { controllers } from "app/domain";
import { middlewares } from "app/middlewares";
import UserModel, { User } from "app/models/User";
import "dotenv/config";
import express from "express";
import { ApiError } from "helpers/ApiError";
import jwt, { JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";
import "reflect-metadata";
import { Action, useExpressServer } from "routing-controllers";
import { IService } from "types/services";

export class Tcp implements IService {
  private static instance: Tcp;
  private routePrefix = "/api";
  private mongoUrl = process.env.DB_HOST!;
  private port = process.env.PORT || 3000;
  private secretKey = process.env.SECRET_KEY || "";
  public server = express();

  constructor() {
    if (!Tcp.instance) {
      Tcp.instance = this;
    }

    return Tcp.instance;
  }

  async connectToDatabase() {
    try {
      await mongoose.connect(this.mongoUrl);
      console.log("Connected to the Mongo database");
    } catch (error) {
      console.error("Database connection error:", error);
      process.exit(1);
    }
  }

  async init() {
    const { server, routePrefix } = this;

    server.use(express.json());

    await this.connectToDatabase();

    useExpressServer(server, {
      routePrefix,
      middlewares,
      authorizationChecker: async (action: Action): Promise<boolean> => {
        const { authorization = "" } = action.request.headers;
        const [bearer, token] = authorization.split(" ");

        try {
          if (bearer !== "Bearer" || !token) {
            console.log("Here")
            const errorData = {
              message: "Invalid or missing Authorization Header",
              code: "UNAUTHORIZED",
            };
            throw new ApiError(401, errorData);
          }

          const decodedToken = jwt.verify(token, this.secretKey) as JwtPayload;

          if (typeof decodedToken !== "object" || !decodedToken.id) {
            const errorData = {
              message: "Invalid token format or missing required data",
              code: "UNAUTHORIZED",
            };
            throw new ApiError(401, errorData);
          }

          const { id } = decodedToken;

          const existingUser = await UserModel.findById(id);

          if (
            !existingUser ||
            !existingUser.token ||
            existingUser.token !== token
          ) {
            const errorData = {
              message: "Expired token or user not found",
              code: "UNAUTHORIZED",
            };
            throw new ApiError(401, errorData);
          }

          action.request.user = existingUser;
          return true;
        } catch (error) {
          const errorData = {
            message: "Expired token or not valid token",
            code: "UNAUTHORIZED",
          };
          throw new ApiError(401, errorData);
        }
      },
      currentUserChecker: async (action: Action): Promise<User> => {
        const { authorization = "" } = action.request.headers;
        const [bearer, token] = authorization.split(" ");

        if (bearer !== "Bearer" || !token) {
          const errorData = {
            message: "Invalid or missing Authorization Header",
            code: "UNAUTHORIZED",
          };
          throw new ApiError(401, errorData);
        }

        try {
          const decodedToken = jwt.verify(token, this.secretKey) as JwtPayload;

          if (typeof decodedToken !== "object" || !decodedToken.id) {
            const errorData = {
              message: "Invalid token format or missing required data",
              code: "UNAUTHORIZED",
            };
            throw new ApiError(401, errorData);
          }

          const { id } = decodedToken;

          const existingUser = await UserModel.findById(id);

          if (
            !existingUser ||
            !existingUser.token ||
            existingUser.token !== token
          ) {
            const errorData = {
              message: "Expired token or user not found",
              code: "UNAUTHORIZED",
            };
            throw new ApiError(401, errorData);
          }

          return existingUser;
        } catch (error) {
          const errorData = {
            message: "Expired token or not valid token",
            code: "UNAUTHORIZED",
          };
          throw new ApiError(401, errorData);
        }
      },
      controllers,
      cors: true,
      defaultErrorHandler: true,
      validation: false,
    });

    return new Promise<boolean>((resolve) => {
      server.listen(this.port, () => {
        console.log(`Tcp service started on port ${this.port}`);

        return resolve(true);
      });
    });
  }
}
