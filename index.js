import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { authRouter, statusRouter } from "./controllers/index.js";
const app = express();
const port = process.env.port || 5000;
app.use(express.json());
app.use(cors());
app.use("/auth", authRouter);
app.use("/status", statusRouter);
const runServer = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://azahqwerty:qwerty123@cluster0.hieqgfi.mongodb.net/`,
      { useNewUrlParser: true, useUnifiedTopology: true }
    );

    app.listen(port, () => {
      console.log(`App is listening ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};
runServer();

