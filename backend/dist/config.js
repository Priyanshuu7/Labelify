"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOTAL_DECIMALS = exports.WORKER_JWT_SECRET = exports.JWT_SECRET = void 0;
exports.JWT_SECRET = (_a = process.env.JWT_SECRET) !== null && _a !== void 0 ? _a : "rajak123";
exports.WORKER_JWT_SECRET = (_b = process.env.WORKER_JWT_SECRET) !== null && _b !== void 0 ? _b : "worker123";
exports.TOTAL_DECIMALS = 1000000;
