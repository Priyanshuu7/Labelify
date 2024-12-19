import { response, Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { JWT_SECRET } from "..";
import { authMiddleware } from "../middleware";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { createTaskInput } from "../types";


const DEFAULT_TITLE = "Select the most clickable thumbnail";

const prismaClient = new PrismaClient();
const router = Router();
const s3Client = new S3Client({
  credentials: {
    accessKeyId: "AKIASFIXCV457LHHH2UW",
    secretAccessKey: "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",
  },
  region: "eu-north-1",
});


router.get("/task", authMiddleware, async (req, res) => {
  //@ts-ignore
  const taskId: string = req.query.taskId;
  //@ts-ignore
  const userId: string = req.userId;

  const taskDetails = await prismaClient.task.findFirst({
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
  const responses = await prismaClient.submission.findMany({
    where: {
      task_id: Number(taskId),
    },
    include: {
      option: true,
    },
  });
  const result: Record<
    string,
    {
      count: number;
      option: {
        imageUrl: string | null;
      };
    }
  > = {};

  taskDetails.options.forEach((option) => {
    result[option.id] = {
      count: 0,
      option: {
        imageUrl: option.image_url,
      },
    };
  });
  responses.forEach((r) => {
    result[r.option_id].count++;
  });
  res.json({
    result,
  });
});

router.post("/task", authMiddleware, async (req, res) => {
  // @ts-ignore
  const userId = req.userId;
  const body = req.body;
  const parseData = createTaskInput.safeParse(body);
  if (!parseData.success) {
    res.status(411).json({ message: "Invalid input" });
    return;
  }

  let response = await prismaClient.$transaction(async (tx) => {
    const response = await tx.task.create({
      data: {
        title: parseData.data.title || DEFAULT_TITLE,
        amount: "1",
        signature: parseData.data.signature,
        user_id: userId,
      },
    });
    await tx.option.createMany({
      data: parseData.data.options.map((option) => ({
        image_url: option.imageUrl,
        task_id: response.id,
      })),
    });
    return response;
  });
  res.json({
    id: response.id,
  });
});

router.get("/presignedUrl", authMiddleware, async (req, res) => {
  //@ts-ignore
  const userId = req.userId;
  const { url, fields } = await createPresignedPost(s3Client, {
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
  // console.log({ url, fields });
  res.json({
    preSignedUrl: url,
    fields,
  });
});

router.post("/signin", async (req, res) => {
  const hardcodedWalletAddress = "DZwSAUdxz8goAooy8rBdauQhERToKfGSwGm1PusydS7V";
  const existingUser = await prismaClient.user.findFirst({
    where: {
      address: hardcodedWalletAddress,
    },
  });

  if (existingUser) {
    const token = jwt.sign(
      {
        userId: existingUser.id,
      },
      JWT_SECRET
    );
    res.json({ token });
  } else {
    const user = await prismaClient.user.create({
      data: {
        address: hardcodedWalletAddress,
      },
    });
    const token = jwt.sign(
      {
        userId: user.id,
      },
      JWT_SECRET
    );
    res.json({ token });
  }
});

export default router;
