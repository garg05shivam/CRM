import type { Request, Response } from "express";
import { z } from "zod";
import {
  stockMovementSchema,
} from "./inventory.validation.js";
import {
  createStockMovement,
  getLowStockProducts,
  getStockMovements,
} from "./inventory.service.js";

export const createMovement = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const validation =
    stockMovementSchema.safeParse(req.body);

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

  const result = await createStockMovement(
    validation.data,
    req.user.id,
  );

  res.status(201).json({
    success: true,
    message: "Stock movement created successfully",
    data: result,
  });
};

export const listMovements = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const productId =
    typeof req.query.productId === "string" && req.query.productId.trim() !== ""
      ? req.query.productId.trim()
      : undefined;

  if (productId) {
    const validation = z
      .string()
      .uuid()
      .safeParse(productId);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid product ID",
        code: "INVALID_PRODUCT_ID",
      });

      return;
    }
  }

  const movementType =
    req.query.movementType === "IN" || req.query.movementType === "OUT"
      ? req.query.movementType
      : undefined;

  const search =
    typeof req.query.search === "string"
      ? req.query.search.trim()
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

  const result = await getStockMovements({
    productId,
    movementType,
    search,
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

export const lowStock = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  const products =
    await getLowStockProducts();

  res.status(200).json({
    success: true,
    data: products,
  });
};