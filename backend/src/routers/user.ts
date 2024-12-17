import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { JWT_SECRET } from "..";
import { authMiddleware } from "../middleware";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";

const prismaClient = new PrismaClient();
const router = Router();

const s3Client = new S3Client({
  credentials: {
    accessKeyId: "AKIASFIXCV457LHHH2UW",
    secretAccessKey: "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",
  },
  region: "eu-north-1",
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
