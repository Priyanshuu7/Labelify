import {response, Router} from "express";
import {PrismaClient} from "@prisma/client";
import jwt from "jsonwebtoken";
import {S3Client, GetObjectCommand} from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {JWT_SECRET} from "../config";
import {authMiddleware} from "../middleware";
import {createPresignedPost} from "@aws-sdk/s3-presigned-post";
import {createTaskInput} from "../types";

// Default title for tasks if none is provided
const DEFAULT_TITLE = "Select the most clickable thumbnail";

// Initialize Prisma Client for database operations
const prismaClient = new PrismaClient();
// Initialize Express Router
const router = Router();
// Initialize S3 Client for AWS S3 operations
const s3Client = new S3Client({
    credentials: {
        // AWS Access Key ID for S3 client authentication
        accessKeyId: "AKIASFIXCV457LHHH2UW",
        // AWS Secret Access Key for S3 client authentication
        secretAccessKey: "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"
    },
    region: "eu-north-1"
});

// Route to get task details
router.get("/task", authMiddleware, async(req, res) => {
    //@ts-ignore
    const taskId : string = req.query.taskId;
    //@ts-ignore
    const userId : string = req.userId;

    // Fetch task details for the given user and task ID
    const taskDetails = await prismaClient
        .task
        .findFirst({
            where: {
                user_id: Number(userId),
                id: Number(taskId)
            },
            include: {
                options: true
            }
        });
    if (!taskDetails) {
        res
            .status(411)
            .json({message: "You dont have acces to this task"});
        return;
    }

    // Fetch all submissions for the task
    const responses = await prismaClient
        .submission
        .findMany({
            where: {
                task_id: Number(taskId)
            },
            include: {
                option: true
            }
        });

    // Prepare result object to count submissions per option
    const result : Record < string, {
            count: number;
            option: {
                imageUrl: string | null;
            };
        } > = {};

    // Initialize result with options
    taskDetails
        .options
        .forEach((option) => {
            result[option.id] = {
                count: 0,
                option: {
                    imageUrl: option.image_url
                }
            };
        });

    // Count submissions for each option
    responses.forEach((r) => {
        result[r.option_id].count++;
    });

    // Send the result as JSON response
    res.json({result});
});

// Route to create a new task
router.post("/task", authMiddleware, async(req, res) => {
    // @ts-ignore
    const userId = req.userId;
    const body = req.body;
    const parseData = createTaskInput.safeParse(body);
    if (!parseData.success) {
        res
            .status(411)
            .json({message: "Invalid input"});
        return;
    }

    // Create task and options within a transaction
    let response = await prismaClient.$transaction(async(tx) => {
        const response = await tx
            .task
            .create({
                data: {
                    title: parseData.data.title || DEFAULT_TITLE,
                    amount: "1",
                    signature: parseData.data.signature,
                    user_id: userId
                }
            });
        // create a prisma transction here //
        await tx
            .option
            .createMany({
                data: parseData
                    .data
                    .options
                    .map((option) => ({image_url: option.imageUrl, task_id: response.id}))
            });
        return response;
    });

    // Send the created task ID as JSON response
    res.json({id: response.id});
});

// Route to get a presigned URL for S3
router.get("/presignedUrl", authMiddleware, async(req, res) => {
    //@ts-ignore
    const userId = req.userId;
    const {url, fields} = await createPresignedPost(s3Client, {
        Bucket: "decentralised-fiverrr",
        Key: `fiver/${userId}/${Math.random()}/image.jpg`,
        Conditions: [
            [
                "content-length-range", 0, 5 * 1024 * 1024
            ], // 5 MB max
        ],
        Fields: {
            "Content-Type": "image/png"
        },
        Expires: 3600
    });
    // Send the presigned URL and fields as JSON response
    res.json({preSignedUrl: url, fields});
});

// Route to sign in a user
router.post("/signin", async(req, res) => {
    const hardcodedWalletAddress = "DZwSAUdxz8goAooy8rBdauQhERToKfGSwGm1PusydS7V";
    // Check if user already exists
    const existingUser = await prismaClient
        .user
        .findFirst({
            where: {
                address: hardcodedWalletAddress
            }
        });

    if (existingUser) {
        // Generate JWT token for existing user
        const token = jwt.sign({
            userId: existingUser.id
        }, JWT_SECRET);
        res.json({token});
    } else {
        // Create new user and generate JWT token
        const user = await prismaClient
            .user
            .create({
                data: {
                    address: hardcodedWalletAddress
                }
            });
        const token = jwt.sign({
            userId: user.id
        }, JWT_SECRET);
        res.json({token});
    }
});

export default router;
