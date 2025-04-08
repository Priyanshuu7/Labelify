// Import necessary modules and dependencies
import {Router, Request} from "express";
import {PrismaClient} from "@prisma/client";
import jwt from "jsonwebtoken";
import {WorkerMiddleware} from "../middleware";
import {WORKER_JWT_SECRET} from "../config";
import {getNextTask} from "../db";
import {createSubmissionInput} from "../types";
// import {TOTAL_DECIMALS} from "../config";
// import {number} from "zod";

// Define a constant for total submissions
const TOTAL_SUBMISSIONS = 100;

// Initialize Express Router and Prisma Client
const router = Router();
const prismaClient = new PrismaClient();

router.post("/submission", WorkerMiddleware, async(req, res) => {
    //@ts-ignore
    const userId = req.userId;
    const body = req.body;
    const parsedBody = createSubmissionInput.safeParse(body);

    if (!parsedBody.success) {
        res.status(411).json({message: "Incorrect inputs"});
        return;
    }

    // First check if worker exists
    const worker = await prismaClient.worker.findUnique({
        where: {
            id: Number(userId)
        }
    });

    if (!worker) {
        res.status(404).json({message: "Worker not found"});
        return;
    }

    const task = await getNextTask(Number(userId));
    if (!task || task.id !== Number(parsedBody.data.taskId)) {
        res.status(411).json({message: "You already completed this task"});
        return;
    }

    const amount = Number(task.amount) / TOTAL_SUBMISSIONS;

    const {nextTask} = await prismaClient.$transaction(async(tx) => {
        const submission = await tx.submission.create({
            data: {
                option_id: Number(parsedBody.data.selection),
                worker_id: Number(userId), // Ensure userId is a number
                task_id: Number(parsedBody.data.taskId),
                amount: amount
            }
        });
        
        // Update worker's pending amount
        await tx
            .worker
            .update({
                where: {
                    id: Number(userId)
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
                            worker_id: Number(userId)
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

router.post("/payout", WorkerMiddleware, async(req : Request & {
    userId?: string
}, res) => {
    const userId = req.userId;
    const worker = await prismaClient
        .worker
        .findFirst({
            where: {
                id: Number(userId)
            }
        });

    if (!worker) {
        res
            .status(403)
            .json({"messaage": "user not found"});
        return;
    }

    const address = worker.address;
    const txnId = "0x12334";

    await prismaClient.$transaction(async tx => {
        await tx
            .worker
            .update({
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
        await tx
            .payouts
            .create({
                data: {
                    user_id: Number(userId),
                    amount: worker.pending_amount,
                    status: "Processing",
                    signature: txnId

                }
            })
    });

    res.json({"Message": "Processing Payouts", amount: worker.pending_amount})

});
console.log(WORKER_JWT_SECRET);

// Export the router for use in other parts of the application
export default router;
