import type { IUser } from "../models/User";

declare global {
  namespace Express {
    interface Request {
      user?: Pick<IUser, "_id" | "email" | "role" | "name" | "emailVerified"> & {
        sessionMode?: "customer" | "admin";
        nameColor?: string;
      };
    }
  }
}

export {};
