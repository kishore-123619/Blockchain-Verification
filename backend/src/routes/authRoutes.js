import express from "express";
import {
  googleAuthRedirect,
  googleAuthCallback,
  facebookAuthRedirect,
  facebookAuthCallback,
  oauthDebugPage,
} from "../controllers/studentController.js";

const router = express.Router();

router.get("/google", googleAuthRedirect);
router.get("/google/callback", googleAuthCallback);
router.get("/facebook", facebookAuthRedirect);
router.get("/facebook/callback", facebookAuthCallback);
router.get("/debug", oauthDebugPage);

export default router;
