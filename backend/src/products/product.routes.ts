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
} from "./product.controller.js";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorizeRoles("ADMIN", "WAREHOUSE"),
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
  authorizeRoles("ADMIN", "WAREHOUSE"),
  update,
);

router.delete(
  "/:id",
  authorizeRoles("ADMIN"),
  remove,
);

export default router;