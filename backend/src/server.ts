import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import { pool } from "./pool.js";
import authRoutes from "./auth/auth.routes.js";
import protectedRoutes from "./auth/protected.routes.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middlewares/error.middleware.js";


const app = express();
app.use(express.json());

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/protected", protectedRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "CRM backend is running",
  });
});

app.get("/health/db", async (_req, res) => {
  try {
    const result = await pool.query("SELECT current_database()");

    res.status(200).json({
      success: true,
      message: "Database connection is healthy",
      database: result.rows[0].current_database,
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

app.listen(env.port, () => {
  console.log(`Server running on port ${env.port}`);
});