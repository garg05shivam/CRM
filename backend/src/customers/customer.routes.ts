import { Router } from "express";
import {
  authenticate,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";
import {
  create,
  list,
} from "./customer.controller.js";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorizeRoles("ADMIN", "SALES"),
  create,
);

router.get(
  "/",
  authorizeRoles("ADMIN", "SALES", "ACCOUNTS"),
  list,
);

export default router;