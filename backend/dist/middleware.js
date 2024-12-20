"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerMiddleware = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const _1 = require(".");
const worker_1 = require("./routers/worker");
const authMiddleware = (req, res, next) => {
    var _a;
    const authHeader = (_a = req.headers["authorization"]) !== null && _a !== void 0 ? _a : "";
    try {
        const decoded = jsonwebtoken_1.default.verify(authHeader, _1.JWT_SECRET);
        //@ts-ignore
        if (decoded.userId) {
            //@ts-ignore
            req.userId = decoded.userId;
            next();
        }
        else {
            res.status(403).json({ message: "You are not logged in" });
        }
    }
    catch (e) {
        res.status(403).json({ message: "You are not logged in" });
    }
};
exports.authMiddleware = authMiddleware;
const WorkerMiddleware = (req, res, next) => {
    var _a;
    const authHeader = (_a = req.headers["authorization"]) !== null && _a !== void 0 ? _a : "";
    try {
        const decoded = jsonwebtoken_1.default.verify(authHeader, worker_1.WORKER_JWT_SECRET);
        //@ts-ignore
        if (decoded.userId) {
            //@ts-ignore
            req.userId = decoded.userId;
            next();
        }
        else {
            res.status(403).json({ message: "You are not logged in" });
        }
    }
    catch (e) {
        res.status(403).json({ message: "You are not logged in" });
    }
};
exports.WorkerMiddleware = WorkerMiddleware;
