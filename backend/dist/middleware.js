"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule)
        ? mod
        : {
            "default": mod
        };
};
Object.defineProperty(exports, "__esModule", {value: true});
exports.WorkerMiddleware = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("./config");
// Middleware to authenticate users based on JWT
const authMiddleware = (req, res, next) => {
    var _a;
    // Extract the authorization header from the request
    const authHeader = (_a = req.headers["authorization"]) !== null && _a !== void 0
        ? _a
        : "";
    try {
        // Verify the JWT using the secret key
        const decoded = jsonwebtoken_1
            .default
            .verify(authHeader, config_1.JWT_SECRET);
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
exports.authMiddleware = authMiddleware;
// Middleware to authenticate workers based on JWT
const WorkerMiddleware = (req, res, next) => {
    var _a;
    // Extract the authorization header from the request
    const authHeader = (_a = req.headers["authorization"]) !== null && _a !== void 0
        ? _a
        : "";
    try {
        // Verify the JWT using the worker secret key
        const decoded = jsonwebtoken_1
            .default
            .verify(authHeader, config_1.WORKER_JWT_SECRET);
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
exports.WorkerMiddleware = WorkerMiddleware;
