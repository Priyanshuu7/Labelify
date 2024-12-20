import { sign } from "jsonwebtoken"; // Import the sign function from jsonwebtoken library
import z from "zod"; // Import the zod library for schema validation

// Define the schema for creating a task input
export const createTaskInput = z.object({
  options: z.array(
    z.object({
      imageUrl: z.string(), // Each option must have an imageUrl of type string
    })
  ),
  title: z.string().optional(), // Title is an optional string
  signature: z.string(), // Signature is a required string
});

// Define the schema for creating a submission input
export const createSubmissionInput = z.object({
  taskId: z.string(), // Task ID is a required string
  selection: z.string(), // Selection is a required string
});
