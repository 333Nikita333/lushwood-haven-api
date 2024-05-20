import { ValidationError } from "class-validator";
import { ApiError } from "helpers";

interface ErrorData {
  message: string;
  code: string;
  errors?: ValidationError[];
}

export class ErrorHandler {
  static throwError(
    status: number,
    message: string,
    code: string,
    errors?: ValidationError[]
  ): void {
    const errorData: ErrorData = {
      message,
      code,
      errors,
    };
    throw new ApiError(status, errorData);
  }
}
