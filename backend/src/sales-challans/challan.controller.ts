import type { Request, Response } from "express";
import { z } from "zod";
import {
  createChallanSchema,
} from "./challan.validation.js";
import {
  cancelChallan,
  confirmChallan,
  createChallan,
  getChallanById,
  getChallans,
} from "./challan.service.js";

const idSchema = z.string().uuid();

const getId = (
  value: unknown,
): string | null => {
  const result = idSchema.safeParse(value);

  return result.success
    ? result.data
    : null;
};

export const create = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const validation =
    createChallanSchema.safeParse(req.body);

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

  const challan = await createChallan(
    validation.data,
    req.user.id,
  );

  res.status(201).json({
    success: true,
    message: "Sales challan created successfully",
    data: challan,
  });
};

export const list = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const search =
    typeof req.query.search === "string"
      ? req.query.search.trim()
      : undefined;

  const status =
    typeof req.query.status === "string"
      ? req.query.status.trim()
      : undefined;

  const startDate =
    typeof req.query.startDate === "string"
      ? req.query.startDate.trim()
      : undefined;

  const endDate =
    typeof req.query.endDate === "string"
      ? req.query.endDate.trim()
      : undefined;

  const page = req.query.page ? Number.parseInt(String(req.query.page), 10) : 1;
  const limit = req.query.limit ? Number.parseInt(String(req.query.limit), 10) : 10;
  const unpaginated = req.query.unpaginated === "true";

  const result = await getChallans({
    search,
    status,
    startDate,
    endDate,
    page,
    limit,
    unpaginated,
  });

  res.status(200).json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
};

export const getById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const id = getId(req.params.id);

  if (!id) {
    res.status(400).json({
      success: false,
      message: "Invalid challan ID",
      code: "INVALID_CHALLAN_ID",
    });

    return;
  }

  const challan =
    await getChallanById(id);

  res.status(200).json({
    success: true,
    data: challan,
  });
};

export const confirm = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const id = getId(req.params.id);

  if (!id) {
    res.status(400).json({
      success: false,
      message: "Invalid challan ID",
      code: "INVALID_CHALLAN_ID",
    });

    return;
  }

  const challan =
    await confirmChallan(id);

  res.status(200).json({
    success: true,
    message: "Sales challan confirmed successfully",
    data: challan,
  });
};

export const cancel = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const id = getId(req.params.id);

  if (!id) {
    res.status(400).json({
      success: false,
      message: "Invalid challan ID",
      code: "INVALID_CHALLAN_ID",
    });

    return;
  }

  const challan =
    await cancelChallan(id);

  res.status(200).json({
    success: true,
    message: "Sales challan cancelled successfully",
    data: challan,
  });
};