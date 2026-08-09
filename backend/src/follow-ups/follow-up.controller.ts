import type { Request, Response } from "express";
import { z } from "zod";
import {
  createFollowUpSchema,
  updateFollowUpSchema,
} from "./follow-up.validation.js";
import {
  createFollowUp,
  deleteFollowUp,
  getAllFollowUps,
  getCustomerFollowUps,
  updateFollowUp,
} from "./follow-up.service.js";

const idSchema = z.string().uuid();

const getId = (
  value: unknown,
): string | null => {
  const result = idSchema.safeParse(value);

  return result.success ? result.data : null;
};

export const create = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const customerId = getId(req.params.customerId);

  if (!customerId) {
    res.status(400).json({
      success: false,
      message: "Invalid customer ID",
      code: "INVALID_CUSTOMER_ID",
    });

    return;
  }

  const validation =
    createFollowUpSchema.safeParse(req.body);

  if (!validation.success) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors:
        validation.error.flatten().fieldErrors,
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

  const followUp = await createFollowUp(
    customerId,
    req.user.id,
    validation.data,
  );

  res.status(201).json({
    success: true,
    message: "Follow-up created successfully",
    data: followUp,
  });
};

export const list = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const customerId = getId(req.params.customerId);

  if (!customerId) {
    res.status(400).json({
      success: false,
      message: "Invalid customer ID",
      code: "INVALID_CUSTOMER_ID",
    });

    return;
  }

  const followUps =
    await getCustomerFollowUps(customerId);

  res.status(200).json({
    success: true,
    data: followUps,
  });
};

export const update = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const id = getId(req.params.id);

  if (!id) {
    res.status(400).json({
      success: false,
      message: "Invalid follow-up ID",
      code: "INVALID_FOLLOW_UP_ID",
    });

    return;
  }

  const validation =
    updateFollowUpSchema.safeParse(req.body);

  if (!validation.success) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors:
        validation.error.flatten().fieldErrors,
    });

    return;
  }

  const followUp = await updateFollowUp(
    id,
    validation.data,
  );

  res.status(200).json({
    success: true,
    message: "Follow-up updated successfully",
    data: followUp,
  });
};

export const remove = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const id = getId(req.params.id);

  if (!id) {
    res.status(400).json({
      success: false,
      message: "Invalid follow-up ID",
      code: "INVALID_FOLLOW_UP_ID",
    });

    return;
  }

  await deleteFollowUp(id);

  res.status(200).json({
    success: true,
    message: "Follow-up deleted successfully",
  });
};

export const listAll = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const search =
    typeof req.query.search === "string"
      ? req.query.search.trim()
      : undefined;

  const date =
    typeof req.query.date === "string"
      ? req.query.date.trim()
      : undefined;

  const followUps = await getAllFollowUps(search, date);

  res.status(200).json({
    success: true,
    data: followUps,
  });
};