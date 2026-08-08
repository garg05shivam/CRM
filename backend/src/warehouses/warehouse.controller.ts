import type { Request, Response } from "express";
import { z } from "zod";
import {
  createWarehouseSchema,
  updateWarehouseSchema,
} from "./warehouse.validation.js";
import {
  createWarehouse,
  deleteWarehouse,
  getWarehouseById,
  getWarehouses,
  updateWarehouse,
} from "./warehouse.service.js";

const idSchema = z.string().uuid();

const getId = (value: unknown): string | null => {
  const result = idSchema.safeParse(value);
  return result.success ? result.data : null;
};

export const create = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const validation =
    createWarehouseSchema.safeParse(req.body);

  if (!validation.success) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors:
        validation.error.flatten().fieldErrors,
    });
    return;
  }

  const warehouse = await createWarehouse(
    validation.data,
  );

  res.status(201).json({
    success: true,
    message: "Warehouse created successfully",
    data: warehouse,
  });
};

export const list = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  const warehouses = await getWarehouses();

  res.status(200).json({
    success: true,
    data: warehouses,
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
      message: "Invalid warehouse ID",
      code: "INVALID_WAREHOUSE_ID",
    });
    return;
  }

  const warehouse = await getWarehouseById(id);

  res.status(200).json({
    success: true,
    data: warehouse,
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
      message: "Invalid warehouse ID",
      code: "INVALID_WAREHOUSE_ID",
    });
    return;
  }

  const validation =
    updateWarehouseSchema.safeParse(req.body);

  if (!validation.success) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors:
        validation.error.flatten().fieldErrors,
    });
    return;
  }

  const warehouse = await updateWarehouse(
    id,
    validation.data,
  );

  res.status(200).json({
    success: true,
    message: "Warehouse updated successfully",
    data: warehouse,
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
      message: "Invalid warehouse ID",
      code: "INVALID_WAREHOUSE_ID",
    });
    return;
  }

  await deleteWarehouse(id);

  res.status(200).json({
    success: true,
    message: "Warehouse deleted successfully",
  });
};