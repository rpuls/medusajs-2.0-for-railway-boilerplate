import { NextFunction, Request, Response } from "express";

// Simple in-memory store for rate limiting
// For production, consider using Redis or another distributed store
const ipRequestCount: Record<string, { count: number; resetTime: number }> = {};

/**
 * Rate limiter middleware for asset uploads
 * Limits requests from the same IP to prevent abuse
 */
export const assetUploadRateLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
  const MAX_REQUESTS_PER_WINDOW = 10; // Max 10 uploads per window
  
  const ip = req.ip || "unknown";
  const now = Date.now();
  
  // Initialize or reset if window has passed
  if (!ipRequestCount[ip] || ipRequestCount[ip].resetTime < now) {
    ipRequestCount[ip] = {
      count: 0,
      resetTime: now + WINDOW_MS
    };
  }
  
  // Increment count
  ipRequestCount[ip].count += 1;
  
  // Check if limit exceeded
  if (ipRequestCount[ip].count > MAX_REQUESTS_PER_WINDOW) {
    const retryAfter = Math.ceil((ipRequestCount[ip].resetTime - now) / 1000); // in seconds
    
    res.setHeader("Retry-After", retryAfter.toString());
    return res.status(429).json({
      message: "Too many upload requests. Please try again later.",
      retryAfter
    });
  }
  
  // Clean up old entries periodically
  if (Math.random() < 0.01) { // 1% chance to clean up on each request
    const cleanupTime = now;
    Object.keys(ipRequestCount).forEach(key => {
      if (ipRequestCount[key].resetTime < cleanupTime) {
        delete ipRequestCount[key];
      }
    });
  }
  
  next();
}; 