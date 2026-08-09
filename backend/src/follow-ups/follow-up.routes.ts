import { Router } from "express";
import {
  authenticate,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";
import {
  create,
  list,
  listAll,
  remove,
  update,
} from "./follow-up.controller.js";

const router = Router();

router.use(authenticate);

router.get(
  "/follow-ups",
  authorizeRoles(
    "ADMIN",
    "SALES",
    "ACCOUNTS",
  ),
  listAll,
);

router.post(
  "/customers/:customerId/follow-ups",
  authorizeRoles("ADMIN", "SALES"),
  create,
);

router.get(
  "/customers/:customerId/follow-ups",
  authorizeRoles(
    "ADMIN",
    "SALES",
    "ACCOUNTS",
  ),
  list,
);

router.put(
  "/follow-ups/:id",
  authorizeRoles("ADMIN", "SALES"),
  update,
);

router.delete(
  "/follow-ups/:id",
  authorizeRoles("ADMIN"),
  remove,
);

export default router;