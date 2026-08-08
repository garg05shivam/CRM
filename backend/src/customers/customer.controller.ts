import type { Request, Response } from "express";
import { z } from "zod";
import {
  createCustomerSchema,
  updateCustomerSchema,
} from "./customer.validation.js";
import {
  createCustomer,
  deleteCustomer,
  getCustomerById,
  getCustomers,
  updateCustomer,
} from "./customer.service.js";

const customerIdSchema = z.string().uuid();

const getCustomerId = (req: Request) => {
  const validation = customerIdSchema.safeParse(
    req.params.id,
  );

  if (!validation.success) {
    return null;
  }

  return validation.data;
};

export const create = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const validation = createCustomerSchema.safeParse(
    req.body,
  );

  if (!validation.success) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: validation.error.flatten().fieldErrors,
    });

    return;
  }

  const customer = await createCustomer(validation.data);

  res.status(201).json({
    success: true,
    message: "Customer created successfully",
    data: customer,
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

  const customers = await getCustomers(search);

  res.status(200).json({
    success: true,
    data: customers,
  });
};

export const getById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const id = getCustomerId(req);

  if (!id) {
    res.status(400).json({
      success: false,
      message: "Invalid customer ID",
      code: "INVALID_CUSTOMER_ID",
    });

    return;
  }

  const customer = await getCustomerById(id);

  res.status(200).json({
    success: true,
    data: customer,
  });
};

export const update = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const id = getCustomerId(req);

  if (!id) {
    res.status(400).json({
      success: false,
      message: "Invalid customer ID",
      code: "INVALID_CUSTOMER_ID",
    });

    return;
  }

  const validation = updateCustomerSchema.safeParse(
    req.body,
  );

  if (!validation.success) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: validation.error.flatten().fieldErrors,
    });

    return;
  }

  const customer = await updateCustomer(
    id,
    validation.data,
  );

  res.status(200).json({
    success: true,
    message: "Customer updated successfully",
    data: customer,
  });
};

export const remove = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const id = getCustomerId(req);

  if (!id) {
    res.status(400).json({
      success: false,
      message: "Invalid customer ID",
      code: "INVALID_CUSTOMER_ID",
    });

    return;
  }

  await deleteCustomer(id);

  res.status(200).json({
    success: true,
    message: "Customer deleted successfully",
  });
};