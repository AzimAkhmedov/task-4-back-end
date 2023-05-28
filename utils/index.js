import jwt from "jsonwebtoken";

export const generateAccessToken = (
  id,
  username,
  email,
  registred,
  lastEnterance,
  status
) => {
  const payload = { id, username, email, registred, lastEnterance, status };
  return jwt.sign(payload, "SECRET_KEY", { expiresIn: "24h" });
};
