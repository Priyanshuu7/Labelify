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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Import necessary modules and dependencies
const express_1 = require("express");
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const middleware_1 = require("../middleware");
const config_1 = require("../config");
const db_1 = require("../db");
const types_1 = require("../types");
// Define a constant for total submissions
const TOTAL_SUBMISSIONS = 100;
// Initialize Express Router and Prisma Client
const router = (0, express_1.Router)();
const prismaClient = new client_1.PrismaClient();
// Route to handle submission creation router.post("/submission",
// WorkerMiddleware, async(req, res) => {     //@ts-ignore     const userId =
// req.userId;     const body = req.body; // Get request body     const
// paredBody = createSubmissionInput.safeParse(body); // Validate and parse
// request body     if (paredBody.success) {         // If parsing is successful
//         const task = await getNextTask(Number(userId)); // Fetch the next
// task for the user         if (!task || task             ?.id !==
// Number(paredBody.data.taskId)) {             // Check if task is valid
// res                 .status(411)                 .json({     message: "You
// already completed this task", // Respond with error if task ID is incorrect
//               });             return;         }  // Calculate the amount for
// the submission         const amount = (Number(task.amount) /
// TOTAL_SUBMISSIONS).toString();         const submission =
// prismaClient.$transaction(async(tx) => {             // Create a new
// submission in the database             const submission = await tx
// .submission                 .create({                     data: {
//          option_id: Number(paredBody.data.selection),             worker_id:
// userId,                         task_id: Number(paredBody.data.taskId),
//                   amount     }                 });             await tx
//           .worker          .update({                     where: {
//             id: userId                     },                     data: {
// pending_amount: {                             increment: Number(amount)
//                 }                     }                 }); return
// submission;         });         // Fetch the next task for the user after
// submission         const nextTask = await getNextTask(Number(userId));
// // Respond with the next task and the amount for the current submission
//   res.json({nextTask, amount});     } else {         // Handle case where
// parsing fails (currently does nothing)     } });
router.post("/submission", middleware_1.WorkerMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const userId = req.userId;
    const body = req.body;
    const parsedBody = types_1.createSubmissionInput.safeParse(body);
    if (!parsedBody.success) {
        res
            .status(411)
            .json({ message: "Incorrect inputs" });
        return;
    }
    const task = yield (0, db_1.getNextTask)(Number(userId));
    if (!task || task.id !== Number(parsedBody.data.taskId)) {
        res
            .status(411)
            .json({ message: "You already completed this task" });
        return;
    }
    const amount = Number(task.amount) / TOTAL_SUBMISSIONS;
    const { submission, nextTask } = yield prismaClient.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        // Create a new submission
        const submission = yield tx
            .submission
            .create({
            data: {
                option_id: Number(parsedBody.data.selection),
                worker_id: userId,
                task_id: Number(parsedBody.data.taskId),
                amount: amount
            }
        });
        // Update worker's pending amount
        yield tx
            .worker
            .update({
            where: {
                id: userId
            },
            data: {
                pending_amount: {
                    increment: Number(amount)
                }
            }
        });
        // Fetch next task inside the transaction to ensure updated data
        const nextTask = yield tx
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
                id: true,
                amount: true,
                title: true,
                options: true
            }
        });
        return { submission, nextTask };
    }));
    res.json({ nextTask, amount });
    return;
}));
// Route to get the next task for the worker
router.get("/nextTask", middleware_1.WorkerMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const userId = req.userId; // Extract user ID from request
    const task = yield (0, db_1.getNextTask)(Number(userId)); // Fetch the next task for the user
    if (!task) {
        // If no task is available
        res
            .status(411)
            .json({
            message: "No more task is you to review", // Respond with message indicating no tasks
        });
    }
    else {
        // If a task is available
        res
            .status(411)
            .json({
            task, // Respond with the task details
        });
    }
}));
// Route to handle worker sign-in
router.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const hardcodedWalletAddress = "DZwSAUdxz8goAooy8rBdauQhERToKfGSwGm1PusydS7V"; // Hardcoded wallet address for demonstration
    // Check if a worker with the hardcoded address already exists
    const existingUser = yield prismaClient
        .worker
        .findFirst({
        where: {
            address: hardcodedWalletAddress
        }
    });
    if (existingUser) {
        // If user exists, generate a JWT token
        const token = jsonwebtoken_1.default.sign({
            userId: existingUser.id
        }, config_1.WORKER_JWT_SECRET);
        res.json({ token }); // Respond with the token
    }
    else {
        // If user does not exist, create a new worker
        const user = yield prismaClient
            .worker
            .create({
            data: {
                address: hardcodedWalletAddress,
                pending_amount: 0,
                locked_amount: 0
            }
        });
        // Generate a JWT token for the new user
        const token = jsonwebtoken_1.default.sign({
            userId: user.id
        }, config_1.WORKER_JWT_SECRET);
        res.json({ token }); // Respond with the token
    }
}));
router.get("/balance", middleware_1.WorkerMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const worker = yield prismaClient
        .worker
        .findFirst({
        where: {
            id: Number(userId)
        }
    });
    res.json({
        PendingAmount: worker === null || worker === void 0 ? void 0 : worker.pending_amount,
        LockedAmount: worker === null || worker === void 0 ? void 0 : worker.locked_amount
    });
}));
router.post("/payout", middleware_1.WorkerMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const worker = yield prismaClient.worker.findFirst({
        where: {
            id: Number(userId)
        }
    });
    if (!worker) {
        res.status(403).json({
            "messaage": "user not found"
        });
        return;
    }
    const address = worker.address;
    const txnId = "0x12334";
    yield prismaClient.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        yield tx.worker.update({
            where: {
                id: Number(userId)
            },
            data: {
                pending_amount: {
                    decrement: worker.pending_amount
                },
                locked_amount: {
                    increment: worker.pending_amount
                }
            }
        });
        yield tx.payouts.create({
            data: {
                user_id: Number(userId),
                amount: worker.pending_amount,
                status: "Processing",
                signature: txnId
            }
        });
    }));
    res.json({
        "Message": "Processing Payouts",
        amount: worker.pending_amount
    });
}));
console.log(config_1.WORKER_JWT_SECRET);
// Export the router for use in other parts of the application
exports.default = router;
