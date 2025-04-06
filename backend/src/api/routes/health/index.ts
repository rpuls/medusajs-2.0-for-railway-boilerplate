/**
 * Health Check API Routes
 */
import { Request, Response, Router } from "express";

type HealthStatus = {
  status: "ok" | "error";
  timestamp: string;
  uptime: number;
  version: string;
  database: {
    status: "connected" | "error";
    message?: string;
  };
  services: Record<string, "ok" | "error">;
  environment: string;
};

// Custom wrapper for route handlers
const wrapHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res);
  } catch (error) {
    next(error);
  }
};

// Health check handler
const getHealthStatus = async (req: Request, res: Response) => {
  try {
    const packageJson = require("../../../package.json");
    
    const status: HealthStatus = {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: packageJson.version,
      database: {
        status: "connected"
      },
      services: {
        api: "ok",
      },
      environment: process.env.NODE_ENV || "development"
    };
    
    // You can add specific health checks here for:
    // - Database connection
    // - Redis connection (if used)
    // - MinIO connection
    // - Third-party services
    
    return res.status(200).json(status);
  } catch (error) {
    const status = {
      status: "error",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error"
    };
    
    return res.status(500).json(status);
  }
};

export default (router) => {
  const healthRouter = Router();
  router.use("/health", healthRouter);

  healthRouter.get("/", wrapHandler(getHealthStatus));

  return router;
}; 