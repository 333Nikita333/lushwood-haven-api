import { ValidationError } from "class-validator";
import { HttpError } from "routing-controllers";

interface MessageInterface {
  status: number;
  message?: string;
  code?: string;
  errors?: ValidationError[];
}

export class ApiError extends HttpError {
  protected error: MessageInterface;
  public removeLog: boolean;

  constructor(status = 500, error: Omit<MessageInterface, "status">) {
    super(status);

    if (this.stack) {
      delete this.stack;
    }

    this.name = "ApiError";
    this.error = { ...error, status, code: error.code || "INTERNAL_ERROR" };
  }
}
