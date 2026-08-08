import { Router } from "express";
import {
  authenticate,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/me", authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Authenticated successfully",
    data: {
      userId: req.user?.id,
      role: req.user?.role,
    },
  });
});

router.get(
  "/admin-only",
  authenticate,
  authorizeRoles("ADMIN"),
  (_req, res) => {
    res.status(200).json({
      success: true,
      message: "Admin access granted",
    });
  },
);

export default router;