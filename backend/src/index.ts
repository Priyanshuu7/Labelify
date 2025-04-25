import 'dotenv/config';
import express from "express";
import userRouter from "./routers/user"
import workerRouter from "./routers/worker"
import cors from "cors";

const PORT = 3000;
const app = express();

app.use(express.json());
app.use(cors())

app.use("/v1/user", userRouter);
app.use("/v1/worker", workerRouter);

app.listen(PORT, () => {
  console.log(`Server is running at ${PORT}`);
});


