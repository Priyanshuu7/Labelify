import { number } from "zod";
import { PrismaClient } from "@prisma/client";

// Initialize Prisma Client
const prismaClient = new PrismaClient();

// Function to get the next task for a user
export const getNextTask = async (userId: number) => {
  // Find the first task that is not done and has no submissions from the given user
  const task = await prismaClient.task.findFirst({
    where: {
      done: false,
      submissions: {
        none: {
          worker_id: userId,
        },
      },
    },
    select: {
      id: true, // Select task ID
      amount: true, // Select task amount
      title: true, // Select task title
      options: true, // Select task options
    },
  });
  return task; // Return the found task
};
