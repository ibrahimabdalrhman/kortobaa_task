import { NextFunction, Request, Response } from "express";
import ApiError from "../utils/apiError";

export default (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {

  err.statusCode = err.statusCode || 500;
  if (process.env.NODE_ENV === "development") {
    res.status(err.statusCode).json({
      status: false,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    res.status(err.statusCode).json({
      status: false,
      message: err.message,
    });
  }
};
