import type { ErrorRequestHandler, RequestHandler } from "express";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(
    message: string,
    statusCode = 500,
    code = "INTERNAL_SERVER_ERROR",
  ) {
    super(message);

    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    code: "ROUTE_NOT_FOUND",
  });
};

export const errorHandler: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next,
) => {
  console.error(error);

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      code: error.code,
    });

    return;
  }


  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error
  ) {
    const pgErr = error as { code: string; detail?: string; constraint?: string };

    if (pgErr.code === "23505") {
      res.status(409).json({
        success: false,
        message: "A record with this unique information already exists.",
        code: "DUPLICATE_ENTRY",
      });

      return;
    }

    if (pgErr.code === "23503") {
      res.status(400).json({
        success: false,
        message: "Cannot complete operation as this item is referenced by other records.",
        code: "FOREIGN_KEY_VIOLATION",
      });

      return;
    }
  }

  res.status(500).json({
    success: false,
    message: "Internal server error",
    code: "INTERNAL_SERVER_ERROR",
  });
};