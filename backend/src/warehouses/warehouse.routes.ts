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
} from "./warehouse.controller.js";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorizeRoles("ADMIN"),
  create,
);

router.get(
  "/",
  authorizeRoles(
    "ADMIN",
    "SALES",
    "WAREHOUSE",
    "ACCOUNTS",
  ),
  list,
);

router.get(
  "/:id",
  authorizeRoles(
    "ADMIN",
    "SALES",
    "WAREHOUSE",
    "ACCOUNTS",
  ),
  getById,
);

router.put(
  "/:id",
  authorizeRoles("ADMIN"),
  update,
);

router.delete(
  "/:id",
  authorizeRoles("ADMIN"),
  remove,
);

export default router;