import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "..";
import { WorkerMiddleware } from "../middleware";
export const WORKER_JWT_SECRET = JWT_SECRET + "worker";

const router = Router();
const prismaClient = new PrismaClient();

router.get("/nextTask", WorkerMiddleware, async (req,res)=>{
    //@ts-ignore
    const userId = req.userId
    const task = await prismaClient.task.findFirst({
        where:{
            
        }
    })

})












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
