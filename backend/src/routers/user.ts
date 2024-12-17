import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { JWT_SECRET } from "..";
import { authMiddleware } from "../middleware";

const prismaClient = new PrismaClient();
const router = Router();

const s3Client = new S3Client();
router.get("/presignedUrl", authMiddleware, async (req, res) => {
  //@ts-ignore
  const userId = req.userId;
  const command = new GetObjectCommand({
    Bucket: "some-bucket",
    Key: "some-object",
  });
  const preSignedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 3600,
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
