import type {
  Request,
  Response,
} from "express";

import { z } from "zod";

import {
  createUserSchema,
  updateUserSchema,
  changeUserPasswordSchema,
} from "./user.validation.js";

import {
  createUser,
  getUserById,
  getUsers,
  updateUser,
  changeUserPassword,
} from "./user.service.js";

const userIdSchema =
  z.string().uuid();

const getUserId = (
  req: Request,
) => {
  const validation =
    userIdSchema.safeParse(
      req.params.id,
    );

  if (!validation.success) {
    return null;
  }

  return validation.data;
};

export const list = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  const users =
    await getUsers();

  res.status(200).json({
    success: true,
    data: users,
  });
};

export const getById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const id = getUserId(req);

  if (!id) {
    res.status(400).json({
      success: false,
      message: "Invalid user ID",
      code: "INVALID_USER_ID",
    });

    return;
  }

  const user =
    await getUserById(id);

  res.status(200).json({
    success: true,
    data: user,
  });
};

export const create = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const validation =
    createUserSchema.safeParse(
      req.body,
    );

  if (!validation.success) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors:
        validation.error.flatten()
          .fieldErrors,
    });

    return;
  }

  const user =
    await createUser(
      validation.data,
    );

  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: user,
  });
};

export const update = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const id = getUserId(req);

  if (!id) {
    res.status(400).json({
      success: false,
      message: "Invalid user ID",
      code: "INVALID_USER_ID",
    });

    return;
  }

  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });

    return;
  }

  const validation =
    updateUserSchema.safeParse(
      req.body,
    );

  if (!validation.success) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors:
        validation.error.flatten()
          .fieldErrors,
    });

    return;
  }

  const user =
    await updateUser(
      id,
      validation.data,
      req.user.id,
    );

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: user,
  });
};

export const changePassword =
  async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const id = getUserId(req);

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Invalid user ID",
        code: "INVALID_USER_ID",
      });

      return;
    }

    const validation =
      changeUserPasswordSchema.safeParse(
        req.body,
      );

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors:
          validation.error.flatten()
            .fieldErrors,
      });

      return;
    }

    const user =
      await changeUserPassword(
        id,
        validation.data.password,
      );

    res.status(200).json({
      success: true,
      message:
        "User password changed successfully",
      data: user,
    });
  };