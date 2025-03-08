"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSubmissionInput = exports.createTaskInput = void 0;
// import { sign } from "jsonwebtoken"; // Import the sign function from jsonwebtoken library
const zod_1 = __importDefault(require("zod")); // Import the zod library for schema validation
// Define the schema for creating a task input
exports.createTaskInput = zod_1.default.object({
    options: zod_1.default.array(zod_1.default.object({
        imageUrl: zod_1.default.string(), // Each option must have an imageUrl of type string
    })),
    title: zod_1.default.string().optional(),
    signature: zod_1.default.string(), // Signature is a required string
});
// Define the schema for creating a submission input
exports.createSubmissionInput = zod_1.default.object({
    taskId: zod_1.default.string(),
    selection: zod_1.default.string(), // Selection is a required string
});
