import { Router } from "express";
import {
  authenticate,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";
import {
  lowStock,
  recentChallans,
  recentStockMovements,
  summary,
} from "./dashboard.controller.js";

const router = Router();

router.use(authenticate);

router.get(
  "/summary",
  authorizeRoles(
    "ADMIN",
    "SALES",
    "WAREHOUSE",
    "ACCOUNTS",
  ),
  summary,
);

router.get(
  "/recent-challans",
  authorizeRoles(
    "ADMIN",
    "SALES",
    "ACCOUNTS",
  ),
  recentChallans,
);

router.get(
  "/recent-stock-movements",
  authorizeRoles(
    "ADMIN",
    "WAREHOUSE",
    "ACCOUNTS",
  ),
  recentStockMovements,
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