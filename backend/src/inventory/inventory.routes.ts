import { Router } from "express";
import {
  authenticate,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";
import {
  createMovement,
  listMovements,
  lowStock,
} from "./inventory.controller.js";

const router = Router();

router.use(authenticate);

router.post(
  "/movements",
  authorizeRoles("ADMIN", "WAREHOUSE"),
  createMovement,
);

router.get(
  "/movements",
  authorizeRoles(
    "ADMIN",
    "SALES",
    "WAREHOUSE",
    "ACCOUNTS",
  ),
  listMovements,
);

router.get(
  "/low-stock",
  authorizeRoles(
    "ADMIN",
    "SALES",
    "WAREHOUSE",
    "ACCOUNTS",
  ),
  lowStock,
);

export default router;