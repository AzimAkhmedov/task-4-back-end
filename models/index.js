import { Schema, model } from "mongoose";

const User = new Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  registred: { type: String, unique: false, required: true },
  lastEnterance: { type: String, unique: false, required: true },
  status: { type: String, unique: false, required: true },
  password: { type: String, required: true },
});

export default model("User", User);
