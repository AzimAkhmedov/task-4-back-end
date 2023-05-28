import { generateAccessToken } from "../utils/index.js";
import { validationResult } from "express-validator";
import { middleware } from "../middleware/index.js";
import { Router } from "express";
import User from "../models/index.js";
import bcrypt from "bcryptjs";
let authRouter = new Router();
let statusRouter = new Router();

authRouter.post("/register", async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Значения не введены" });
    }

    const { username, password, email } = req.body;
    let time = new Date().toLocaleString("en-US", {
      day: "numeric",
      weekday: "long",
      month: "numeric",
      year: "numeric",
    });
    const candidate = await User.findOne({ username });
    const emailCandidate = await User.findOne({ email });

    if (candidate) {
      return res
        .status(400)
        .json({ message: "Пользователь с таким именем уже существует" });
    }
    if (emailCandidate) {
      return res.status(400).json({ message: "Такое мыло уже зарегано" });
    }
    const hashPassword = bcrypt.hashSync(password, 7);
    const user = new User({
      username,
      email,
      password: hashPassword,
      status: "Not-blocked",
      lastEnterance: time,
      registred: time,
    });
    const token = generateAccessToken(user._id, username, user.roles);
    await user.save();

    return res.json({ token });
  } catch (e) {
    console.log(e);
    res.status(400).json({ message: "Registration error" });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: `Не верные данные` });
    }

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      return res.status(400).json({
        message: `Не верные данные`,
      });
    }
    let date = new Date().toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
      timeZoneName: "short",
    });
    await user.replaceOne({
      _id: user._id,
      password: user.password,
      username: user.username,
      email: user.email,
      registred: user.registred,
      status: user.status,

      lastEnterance: date,
    });

    const token = generateAccessToken(
      user._id,
      user.username,
      user.email,
      user.registred,
      date,
      user.status
    );
    return res.json({ token });
  } catch (e) {
    console.log(e);
    res.status(400).json({ message: "Login error" });
  }
});

authRouter.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (e) {
    console.log(e);
  }
});

authRouter.get("/check", middleware, (req, res) => {
  const token = generateAccessToken(
    req.user._id,
    req.user.username,
    req.user.email,
    req.user.registred,
    req.user.lastEnterance,
    req.user.status
  );
  return res.json({ token });
});
authRouter.delete("/user/:username", async (req, res) => {
  const username = req.params.username;
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(400).json({ message: "There is no such user" });
  }
  await User.deleteOne({ username });
  return res.json({ user });
});

statusRouter.put("/", async (req, res) => {
  const { username, stat } = req.body;
  const user = User.findOne({ username });
  if (!user) {
    return res
      .status(400)
      .json({ message: "Мы не смогли найти такого пользователья " });
  }
  const newuser = {
    username: user.username,
    password: user.password,
    status: stat,
    email: user.email,
    registred: user.registred,
    user: user.lastEnterance,
  };
  await user.updateOne(newuser);
  res.status(200).json({ message: "It was changed OK" });
});
export { authRouter, statusRouter };
