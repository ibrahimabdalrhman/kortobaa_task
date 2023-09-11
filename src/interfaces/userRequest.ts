import { User } from "../models/user";
import { Request } from "express";

export default interface userRequest extends Request {
  user?: number | User;
}