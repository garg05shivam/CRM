import type { Request, Response } from "express";
import {
  getDashboardLowStock,
  getDashboardSummary,
  getRecentChallans,
  getRecentStockMovements,
} from "./dashboard.service.js";

export const summary = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  const data = await getDashboardSummary();

  res.status(200).json({
    success: true,
    data,
  });
};

export const recentChallans = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  const data = await getRecentChallans();

  res.status(200).json({
    success: true,
    data,
  });
};

export const recentStockMovements = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  const data = await getRecentStockMovements();

  res.status(200).json({
    success: true,
    data,
  });
};

export const lowStock = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  const data = await getDashboardLowStock();

  res.status(200).json({
    success: true,
    data,
  });
};