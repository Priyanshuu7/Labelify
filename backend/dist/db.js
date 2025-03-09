"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNextTask = void 0;
const client_1 = require("@prisma/client");
// Initialize Prisma Client
const prismaClient = new client_1.PrismaClient();
// Function to get the next task for a user
const getNextTask = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    // Find the first task that is not done and has no submissions from the given
    // user
    const task = yield prismaClient
        .task
        .findFirst({
        where: {
            done: false,
            submissions: {
                none: {
                    worker_id: userId
                }
            }
        },
        select: {
            id: true, // Select task ID
            amount: true, // Select task amount
            title: true, // Select task title
            options: true, // Select task options
        }
    });
    return task; // Return the found task
});
exports.getNextTask = getNextTask;
