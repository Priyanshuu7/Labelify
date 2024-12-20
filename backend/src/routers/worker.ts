import { Submission } from "./../../node_modules/.prisma/client/index.d";
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { WorkerMiddleware } from "../middleware";
import { WORKER_JWT_SECRET } from "../config";
import { getNextTask } from "../db";
import { createSubmissionInput } from "../types";

const TOTAL_SUBMISSIONS = 100;

const router = Router();
const prismaClient = new PrismaClient();

router.post("/submission", WorkerMiddleware, async (req, res) => {
  //@ts-ignore
  const userId = req.userId;
  const body = req.body;
  const paredBody = createSubmissionInput.safeParse(body);

  if (paredBody.success) {
    const task = await getNextTask(Number(userId));
    if (!task || task?.id !== Number(paredBody.data.taskId)) {
      res.status(411).json({
        message: "Incorrect task id ",
      });
      return;
    }
    const amount = (Number(task.amount) / TOTAL_SUBMISSIONS).toString();
    const submission = await prismaClient.submission.create({
      data: {
        option_id: Number(paredBody.data.selection),
        worker_id: userId,
        task_id: Number(paredBody.data.taskId),
        amount,
      },
    });
    const nextTask = await getNextTask(Number(userId));
    res.json({
      nextTask,
      amount,
    });
  } else {
  }
});

router.get("/nextTask", WorkerMiddleware, async (req, res) => {
  //@ts-ignore
  const userId = req.userId;
  const task = await getNextTask(Number(userId));

  if (!task) {
    res.status(411).json({
      message: "No more task is you to review",
    });
  } else {
    res.status(411).json({
      task,
    });
  }
});

router.post("/signin", async (req, res) => {
  const hardcodedWalletAddress = "DZwSAUdxz8goAooy8rBdauQhERToKfGSwGm1PusydS7V";
  const existingUser = await prismaClient.worker.findFirst({
    where: {
      address: hardcodedWalletAddress,
    },
  });

  if (existingUser) {
    const token = jwt.sign(
      {
        userId: existingUser.id,
      },
      WORKER_JWT_SECRET
    );
    res.json({ token });
  } else {
    const user = await prismaClient.worker.create({
      data: {
        address: hardcodedWalletAddress,
        pending_amount: 0,
        locked_amount: 0,
      },
    });
    const token = jwt.sign(
      {
        userId: user.id,
      },
      WORKER_JWT_SECRET
    );
    res.json({ token });
  }
});
export default router;
