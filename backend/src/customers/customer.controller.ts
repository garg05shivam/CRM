import type { Request, Response } from "express";
import {
  createCustomerSchema,
} from "./customer.validation.js";
import {
  createCustomer,
  getCustomers,
} from "./customer.service.js";

export const create = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const validation = createCustomerSchema.safeParse(req.body);

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