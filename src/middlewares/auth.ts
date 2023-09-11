import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { User } from "../models/user";
import ApiError from "../utils/apiError";
import userRequest from "../interfaces/userRequest";

export default async (req: userRequest, res: Response, next: NextFunction) => {
  try {
    let token;
    if (req.headers.authorization) {
      token = req.headers.authorization.replace("Bearer ", "");
    }
    if (!token) {
      return next(new ApiError("You must login", 401));
    }
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return next(new ApiError("You must login", 401));
    }
    req.user = user.id;

    next();
  } catch (error) {
      return next(new ApiError("You must login", 401));
  }
};
