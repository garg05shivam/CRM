import type { Request, Response } from "express";
import { z } from "zod";
import {
  createProductSchema,
  updateProductSchema,
} from "./product.validation.js";
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from "./product.service.js";

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
  const validation =
    createProductSchema.safeParse(req.body);

  if (!validation.success) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors:
        validation.error.flatten().fieldErrors,
    });

    return;
  }

  const product = await createProduct(
    validation.data,
  );

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: product,
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

  const products = await getProducts(search);

  res.status(200).json({
    success: true,
    data: products,
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
      message: "Invalid product ID",
      code: "INVALID_PRODUCT_ID",
    });

    return;
  }

  const product = await getProductById(id);

  res.status(200).json({
    success: true,
    data: product,
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
      message: "Invalid product ID",
      code: "INVALID_PRODUCT_ID",
    });

    return;
  }

  const validation =
    updateProductSchema.safeParse(req.body);

  if (!validation.success) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors:
        validation.error.flatten().fieldErrors,
    });

    return;
  }

  const product = await updateProduct(
    id,
    validation.data,
  );

  res.status(200).json({
    success: true,
    message: "Product updated successfully",
    data: product,
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
      message: "Invalid product ID",
      code: "INVALID_PRODUCT_ID",
    });

    return;
  }

  await deleteProduct(id);

  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
};