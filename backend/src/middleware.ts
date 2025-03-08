import {NextFunction, Request, Response} from "express";
import jwt from "jsonwebtoken";
import {JWT_SECRET, WORKER_JWT_SECRET} from "./config";

// Middleware to authenticate users based on JWT
export const authMiddleware = (req : Request, res : Response, next : NextFunction) => {
    // Extract the authorization header from the request
    const authHeader = req.headers["authorization"] ?? "";
    try {
        // Verify the JWT using the secret key
        const decoded = jwt.verify(authHeader, JWT_SECRET);
        //@ts-ignore
        if (decoded.userId) {
            // If userId is present in the decoded token, attach it to the request object
            // @ts-ignore
            req.userId = decoded.userId;
            // Proceed to the next middleware or route handler
            next();
        } else {
            // If userId is not present, respond with a 403 status
            res
                .status(403)
                .json({message: "You are not logged in"});
        }
    } catch (e) {
        // If token verification fails, respond with a 403 status
        res
            .status(403)
            .json({message: "You are not logged in"});
    }
};

// Middleware to authenticate workers based on JWT
export const WorkerMiddleware = (req : Request, res : Response, next : NextFunction) => {
    // Extract the authorization header from the request
    const authHeader = req.headers["authorization"] ?? "";
    try {
        // Verify the JWT using the worker secret key
        const decoded = jwt.verify(authHeader, WORKER_JWT_SECRET);
        //@ts-ignore
        if (decoded.userId) {
            // If userId is present in the decoded token, attach it to the request object
            // @ts-ignore
            req.userId = decoded.userId;
            // Proceed to the next middleware or route handler
            next();
        } else {
            // If userId is not present, respond with a 403 status
            res
                .status(403)
                .json({message: "You are not logged in"});
        }
    } catch (e) {
        // If token verification fails, respond with a 403 status
        res
            .status(403)
            .json({message: "You are not logged in"});
    }
};
