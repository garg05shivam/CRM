import { Router } from "express";
import {
  authenticate,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";
import {
  cancel,
  confirm,
  create,
  getById,
  list,
} from "./challan.controller.js";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorizeRoles("ADMIN", "SALES"),
  create,
);

router.get(
  "/",
  authorizeRoles(
    "ADMIN",
    "SALES",
    "ACCOUNTS",
  ),
  list,
);

router.get(
  "/:id",
  authorizeRoles(
    "ADMIN",
    "SALES",
    "ACCOUNTS",
  ),
  getById,
);

router.post(
  "/:id/confirm",
  authorizeRoles("ADMIN", "SALES"),
  confirm,
);

router.post(
  "/:id/cancel",
  authorizeRoles("ADMIN", "SALES"),
  cancel,
);

export default router;