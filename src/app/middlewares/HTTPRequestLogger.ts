import { NextFunction, Request, Response } from "express";
import { ExpressMiddlewareInterface, Middleware } from "routing-controllers";

@Middleware({ type: "before" })
export class HTTPRequestLogger implements ExpressMiddlewareInterface {
  use(request: Request, _response: Response, next: NextFunction) {
    const { originalUrl, method, body } = request;
    console.log(
      `Request: method=${method}, path=${originalUrl}, body=${JSON.stringify(
        body
      )}`
    );
    next();
  }
}
