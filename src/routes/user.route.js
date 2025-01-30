import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser, sendVerificationEmail } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()


router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/send-verification-email").post(sendVerificationEmail);

// Secured route 
router.route("/logout").get(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);

export default router;