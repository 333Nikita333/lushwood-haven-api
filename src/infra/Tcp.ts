import "reflect-metadata";
import express from "express";
import { useExpressServer } from "routing-controllers";
import { controllers } from "app/domain";
import { middlewares } from "app/middlewares";
import { IService } from "types/services";
import mongoose from "mongoose";
import "dotenv/config";

export class Tcp implements IService {
  private static instance: Tcp;
  private routePrefix = "/api";
  private mongoUrl = process.env.DB_HOST!;
  private port = process.env.PORT || 3000;
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
      controllers,
      middlewares,
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
