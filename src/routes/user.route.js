import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()


router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

// Secured route 
router.route("/logout").get(verifyJWT, logoutUser);

export default router;