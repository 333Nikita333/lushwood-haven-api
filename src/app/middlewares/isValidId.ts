import { NextFunction, Request, Response } from "express";
import { ApiError } from "helpers/ApiError";
import { isValidObjectId } from "mongoose";
import { ExpressMiddlewareInterface } from "routing-controllers";

export class isValidId implements ExpressMiddlewareInterface {
  use(request: Request, _: Response, next: NextFunction) {
    const { id } = request.params;

    if (!isValidObjectId(id)) {
      const errorData = {
        message: "Invalid id format",
        code: "BAD_REQUEST",
      };
      throw new ApiError(400, errorData);
    }
    next();
  }
}
