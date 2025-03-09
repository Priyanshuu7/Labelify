// Import necessary modules and dependencies
import {Router, Request} from "express";
import {PrismaClient} from "@prisma/client";
import jwt from "jsonwebtoken";
import {WorkerMiddleware} from "../middleware";
import {WORKER_JWT_SECRET} from "../config";
import {getNextTask} from "../db";
import {createSubmissionInput} from "../types";
import {TOTAL_DECIMALS} from "../config";

// Define a constant for total submissions
const TOTAL_SUBMISSIONS = 100;

// Initialize Express Router and Prisma Client
const router = Router();
const prismaClient = new PrismaClient();

// Route to handle submission creation router.post("/submission",
// WorkerMiddleware, async(req, res) => {     //@ts-ignore     const userId =
// req.userId;     const body = req.body; // Get request body     const
// paredBody = createSubmissionInput.safeParse(body); // Validate and parse
// request body     if (paredBody.success) {         // If parsing is successful
//         const task = await getNextTask(Number(userId)); // Fetch the next
// task for the user         if (!task || task             ?.id !==
// Number(paredBody.data.taskId)) {             // Check if task is valid
//      res                 .status(411)                 .json({
//     message: "You already completed this task", // Respond with error if
// task ID is incorrect                 });             return;         }
//  // Calculate the amount for the submission         const amount =
// (Number(task.amount) / TOTAL_SUBMISSIONS).toString();         const
// submission = prismaClient.$transaction(async(tx) => {             // Create a
// new submission in the database             const submission = await tx
//          .submission                 .create({                     data: {
//                      option_id: Number(paredBody.data.selection),
//             worker_id: userId,                         task_id:
// Number(paredBody.data.taskId),                         amount
//     }                 });             await tx                 .worker
//          .update({                     where: {                         id:
// userId                     },                     data: {
//     pending_amount: {                             increment: Number(amount)
//                       }                     }                 });
// return submission;         });         // Fetch the next task for the user
// after submission         const nextTask = await getNextTask(Number(userId));
//        // Respond with the next task and the amount for the current
// submission         res.json({nextTask, amount});     } else {         //
// Handle case where parsing fails (currently does nothing)     } });
router.post("/submission", WorkerMiddleware, async(req, res) => {
    //@ts-ignore
    const userId = req.userId;
    const body = req.body;
    const parsedBody = createSubmissionInput.safeParse(body);

    if (!parsedBody.success) {
        res
            .status(411)
            .json({message: "Incorrect inputs"});
        return;
    }

    const task = await getNextTask(Number(userId));
    if (!task || task.id !== Number(parsedBody.data.taskId)) {
        res
            .status(411)
            .json({message: "You already completed this task"});
        return;
    }

    const amount = (Number(task.amount) / TOTAL_SUBMISSIONS).toString();

    const {submission, nextTask} = await prismaClient.$transaction(async(tx) => {
        // Create a new submission
        const submission = await tx
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
        await tx
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
        const nextTask = await tx
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

        return {submission, nextTask};
    });

    res.json({nextTask, amount});
    return;
});

// Route to get the next task for the worker
router.get("/nextTask", WorkerMiddleware, async(req, res) => {
    //@ts-ignore
    const userId = req.userId; // Extract user ID from request
    const task = await getNextTask(Number(userId)); // Fetch the next task for the user

    if (!task) {
        // If no task is available
        res
            .status(411)
            .json({
                message: "No more task is you to review", // Respond with message indicating no tasks
            });
    } else {
        // If a task is available
        res
            .status(411)
            .json({
                task, // Respond with the task details
            });
    }
});

// Route to handle worker sign-in
router.post("/signin", async(req, res) => {
    const hardcodedWalletAddress = "DZwSAUdxz8goAooy8rBdauQhERToKfGSwGm1PusydS7V"; // Hardcoded wallet address for demonstration
    // Check if a worker with the hardcoded address already exists
    const existingUser = await prismaClient
        .worker
        .findFirst({
            where: {
                address: hardcodedWalletAddress
            }
        });

    if (existingUser) {
        // If user exists, generate a JWT token
        const token = jwt.sign({
            userId: existingUser.id
        }, WORKER_JWT_SECRET);
        res.json({token}); // Respond with the token
    } else {
        // If user does not exist, create a new worker
        const user = await prismaClient
            .worker
            .create({
                data: {
                    address: hardcodedWalletAddress,
                    pending_amount: 0,
                    locked_amount: 0
                }
            });
        // Generate a JWT token for the new user
        const token = jwt.sign({
            userId: user.id
        }, WORKER_JWT_SECRET);
        res.json({token}); // Respond with the token
    }
});

router.get("/balance", WorkerMiddleware, async(req : Request & {
    userId?: string
}, res) => {
    const userId = req.userId;

    const worker = await prismaClient
        .worker
        .findFirst({
            where: {
                id: Number(userId)

            }
        })
    res.json({
        PendingAmount: worker
            ?.pending_amount,
        LockedAmount: worker
            ?.locked_amount
    })

})
console.log(WORKER_JWT_SECRET);

// Export the router for use in other parts of the application
export default router;
