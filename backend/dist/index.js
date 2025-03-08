"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express")); // Import the express module
const user_1 = __importDefault(require("./routers/user")); // Import the user router
const worker_1 = __importDefault(require("./routers/worker")); // Import the worker router
const app = (0, express_1.default)(); // Create an instance of express
app.use(express_1.default.json()); // Middleware to parse JSON bodies
// Use the user router for routes starting with /v1/user
app.use("/v1/user", user_1.default);
// Use the worker router for routes starting with /v1/worker
app.use("/v1/worker", worker_1.default);
// Start the server and listen on port 3000
app.listen(3000, () => {
    console.log("Server started on port 3000"); // Log a message when the server starts
});
