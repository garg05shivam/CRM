import { Router } from "express";
import {
  authenticate,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";
import {
  create,
  getById,
  list,
  remove,
  update,
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

router.get(
  "/:id",
  authorizeRoles("ADMIN", "SALES", "ACCOUNTS"),
  getById,
);

router.put(
  "/:id",
  authorizeRoles("ADMIN", "SALES"),
  update,
);

router.delete(
  "/:id",
  authorizeRoles("ADMIN"),
  remove,
);

export default router;