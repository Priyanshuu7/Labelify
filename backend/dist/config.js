"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOTAL_DECIMALS = exports.WORKER_JWT_SECRET = exports.JWT_SECRET = void 0;
// JWT_SECRET is the base secret key used for signing JWT tokens tokens
exports.JWT_SECRET = "secret";
// WORKER_JWT_SECRET is derived from JWT_SECRET and is specifically used for
// worker-related JWT tokens
exports.WORKER_JWT_SECRET = exports.JWT_SECRET + "worker";
exports.TOTAL_DECIMALS = 1000000;
