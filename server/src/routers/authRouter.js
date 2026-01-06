import express from "express";
import { checkAuth, login, register, logout } from "../controllers/authController.js";

const authRouter = express.Router();

authRouter.get("/check-auth", checkAuth);
authRouter.post("/login", login);
authRouter.post("/register", register);
authRouter.post("/logout", logout);

export default authRouter;