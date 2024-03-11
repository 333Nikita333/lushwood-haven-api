import { NextFunction, Request, Response } from "express";
import { ExpressMiddlewareInterface } from "routing-controllers";

export class HTTPResponseLogger implements ExpressMiddlewareInterface {
  use(request: Request, response: Response, next: NextFunction) {
    const { originalUrl, method } = request;
    const { statusCode } = response;
    console.log(
      `Response: method = ${method}, path = ${originalUrl}, statusCode = ${statusCode}`
    );
    next();
  }
}
