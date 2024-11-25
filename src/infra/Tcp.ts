import "dotenv/config";
import express from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";
import "reflect-metadata";
import { Action, useExpressServer } from "routing-controllers";
import { controllers } from "../app/domain";
import { IUserResponse } from "../app/domain/user/User.types";
import { middlewares } from "../app/middlewares";
import ChangeStreamHandler from "../app/middlewares/ChangeStreamHandler";
import UserModel from "../app/models/User";
import { ErrorHandler } from "../helpers";
import { IService } from "../types/services";

export class Tcp implements IService {
  private static instance: Tcp;
  private routePrefix = "/api";
  private readonly secretKey = process.env.SECRET_KEY!;
  private readonly mongoUrl = process.env.DB_HOST!;
  private port = process.env.PORT || 3000;

  public server = express();

  constructor() {
    if (!Tcp.instance) {
      Tcp.instance = this;
    }

    return Tcp.instance;
  }

  async authorizationChecker(action: Action): Promise<boolean> {
    const { authorization = "" } = action.request.headers;
    const [bearer, token] = authorization.split(" ");

    try {
      if (bearer !== "Bearer" || !token) {
        ErrorHandler.throwError(
          401,
          "Invalid or missing Authorization Header",
          "UNAUTHORIZED"
        );
      }

      const decodedToken = jwt.verify(token, this.secretKey) as JwtPayload;

      if (typeof decodedToken !== "object" || !decodedToken.id) {
        ErrorHandler.throwError(
          401,
          "Invalid token format or missing required data",
          "UNAUTHORIZED"
        );
      }

      const { id } = decodedToken;

      const existingUser = await UserModel.findById(id);

      if (
        !existingUser ||
        !existingUser.token ||
        existingUser.token !== token
      ) {
        ErrorHandler.throwError(
          401,
          "Expired token or user not found",
          "UNAUTHORIZED"
        );
      }

      action.request.user = existingUser;
      return true;
    } catch (error) {
      throw error;
    }
  }

  async currentUserChecker(action: Action): Promise<IUserResponse | {}> {
    const { authorization = "" } = action.request.headers;
    const [bearer, token] = authorization.split(" ");

    if (bearer !== "Bearer" || !token) {
      ErrorHandler.throwError(
        401,
        "Invalid or missing Authorization Header",
        "UNAUTHORIZED"
      );
    }

    try {
      console.log("current user checker, secretKey =>", this.secretKey);
      const decodedToken = jwt.verify(token, this.secretKey) as JwtPayload;

      if (typeof decodedToken !== "object" || !decodedToken.id) {
        ErrorHandler.throwError(
          401,
          "Invalid token format or missing required data",
          "UNAUTHORIZED"
        );
      }

      const { id } = decodedToken;

      const existingUser = await UserModel.findById(id);

      if (
        !existingUser ||
        !existingUser.token ||
        existingUser.token !== token
      ) {
        ErrorHandler.throwError(
          401,
          "Expired token or user not found",
          "UNAUTHORIZED"
        );
      }

      return existingUser!;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
          ErrorHandler.throwError(
            401,
            "Token has expired",
            "UNAUTHORIZED"
          );
        }

        throw error;
    }
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
      authorizationChecker: this.authorizationChecker.bind(this),
      currentUserChecker: this.currentUserChecker.bind(this),
      middlewares,
      controllers,
      cors: true,
      defaultErrorHandler: true,
      validation: false,
    });

    const changeStreamHandler = ChangeStreamHandler.getInstance();
    changeStreamHandler.watchOrderChanges();

    return new Promise<boolean>((resolve) => {
      server.listen(this.port, () => {
        console.log(`Tcp service started on port ${this.port}`);

        return resolve(true);
      });
    });
  }
}
