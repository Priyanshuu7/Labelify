import express from "express"; // Import the express module
import userRouter from "./routers/user"; // Import the user router
import workerRouter from "./routers/worker"; // Import the worker router

const app = express(); // Create an instance of express
app.use(express.json()); // Middleware to parse JSON bodies

// Use the user router for routes starting with /v1/user
app.use("/v1/user", userRouter);
// Use the worker router for routes starting with /v1/worker
app.use("/v1/worker", workerRouter);

// Start the server and listen on port 3000
app.listen(3000, () => {
    console.log("Server started on port 3000"); // Log a message when the server starts
});
