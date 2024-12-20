import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from ".";
import { WORKER_JWT_SECRET } from "./routers/worker";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"] ?? "";
  try {
    const decoded = jwt.verify(authHeader, JWT_SECRET);
    //@ts-ignore
    if (decoded.userId) {
      //@ts-ignore
      req.userId = decoded.userId;
      next();
    } else {
      res.status(403).json({ message: "You are not logged in" });
    }
  } catch (e) {
    res.status(403).json({ message: "You are not logged in" });
  }
};

export const WorkerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"] ?? "";
  try {
    const decoded = jwt.verify(authHeader, WORKER_JWT_SECRET);
    //@ts-ignore
    if (decoded.userId) {
      //@ts-ignore
      req.userId = decoded.userId;
      next();
    } else {
      res.status(403).json({ message: "You are not logged in" });
    }
  } catch (e) {
    res.status(403).json({ message: "You are not logged in" });
  }
};
