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
const express_1 = require("express");
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_s3_1 = require("@aws-sdk/client-s3");
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
const config_1 = require("../config");
const middleware_1 = require("../middleware");
const s3_presigned_post_1 = require("@aws-sdk/s3-presigned-post");
const types_1 = require("../types");
// Default title for tasks if none is provided
const DEFAULT_TITLE = "Select the most clickable thumbnail";
// Initialize Prisma Client for database operations
const prismaClient = new client_1.PrismaClient();
// Initialize Express Router
const router = (0, express_1.Router)();
// Initialize S3 Client for AWS S3 operations
const s3Client = new client_s3_1.S3Client({
    credentials: {
        // AWS Access Key ID for S3 client authentication
        accessKeyId: "AKIASFIXCV457LHHH2UW",
        // AWS Secret Access Key for S3 client authentication
        secretAccessKey: "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",
    },
    region: "eu-north-1",
});
// Route to get task details
router.get("/task", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const taskId = req.query.taskId;
    //@ts-ignore
    const userId = req.userId;
    // Fetch task details for the given user and task ID
    const taskDetails = yield prismaClient.task.findFirst({
        where: {
            user_id: Number(userId),
            id: Number(taskId),
        },
        include: {
            options: true,
        },
    });
    if (!taskDetails) {
        res.status(411).json({
            message: "You dont have acces to this task",
        });
        return;
    }
    // Fetch all submissions for the task
    const responses = yield prismaClient.submission.findMany({
        where: {
            task_id: Number(taskId),
        },
        include: {
            option: true,
        },
    });
    // Prepare result object to count submissions per option
    const result = {};
    // Initialize result with options
    taskDetails.options.forEach((option) => {
        result[option.id] = {
            count: 0,
            option: {
                imageUrl: option.image_url,
            },
        };
    });
    // Count submissions for each option
    responses.forEach((r) => {
        result[r.option_id].count++;
    });
    // Send the result as JSON response
    res.json({
        result,
    });
}));
// Route to create a new task
router.post("/task", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const userId = req.userId;
    const body = req.body;
    const parseData = types_1.createTaskInput.safeParse(body);
    if (!parseData.success) {
        res.status(411).json({ message: "Invalid input" });
        return;
    }
    // Create task and options within a transaction
    let response = yield prismaClient.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield tx.task.create({
            data: {
                title: parseData.data.title || DEFAULT_TITLE,
                amount: "1",
                signature: parseData.data.signature,
                user_id: userId,
            },
        });
        yield tx.option.createMany({
            data: parseData.data.options.map((option) => ({
                image_url: option.imageUrl,
                task_id: response.id,
            })),
        });
        return response;
    }));
    // Send the created task ID as JSON response
    res.json({
        id: response.id,
    });
}));
// Route to get a presigned URL for S3
router.get("/presignedUrl", middleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const userId = req.userId;
    const { url, fields } = yield (0, s3_presigned_post_1.createPresignedPost)(s3Client, {
        Bucket: "decentralised-fiverrr",
        Key: `fiver/${userId}/${Math.random()}/image.jpg`,
        Conditions: [
            ["content-length-range", 0, 5 * 1024 * 1024], // 5 MB max
        ],
        Fields: {
            "Content-Type": "image/png",
        },
        Expires: 3600,
    });
    // Send the presigned URL and fields as JSON response
    res.json({
        preSignedUrl: url,
        fields,
    });
}));
// Route to sign in a user
router.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const hardcodedWalletAddress = "DZwSAUdxz8goAooy8rBdauQhERToKfGSwGm1PusydS7V";
    // Check if user already exists
    const existingUser = yield prismaClient.user.findFirst({
        where: {
            address: hardcodedWalletAddress,
        },
    });
    if (existingUser) {
        // Generate JWT token for existing user
        const token = jsonwebtoken_1.default.sign({
            userId: existingUser.id,
        }, config_1.JWT_SECRET);
        res.json({ token });
    }
    else {
        // Create new user and generate JWT token
        const user = yield prismaClient.user.create({
            data: {
                address: hardcodedWalletAddress,
            },
        });
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
        }, config_1.JWT_SECRET);
        res.json({ token });
    }
}));
exports.default = router;
