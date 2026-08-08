import { Router } from "express";

import {
  authenticate,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";

import {
  create,
  getById,
  list,
  update,
  changePassword,
} from "./user.controller.js";

const router =
  Router();

router.use(authenticate);

router.use(
  authorizeRoles("ADMIN"),
);

router.post(
  "/",
  create,
);

router.get(
  "/",
  list,
);

router.get(
  "/:id",
  getById,
);

router.put(
  "/:id",
  update,
);

router.put(
  "/:id/password",
  changePassword,
);

export default router;