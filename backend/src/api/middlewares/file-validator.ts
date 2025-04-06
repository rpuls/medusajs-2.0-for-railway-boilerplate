import { NextFunction, Request, Response } from "express";

// Configure allowed file types and maximum size
const ALLOWED_FILE_TYPES = [
  // Images
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  
  // Documents
  "application/pdf",
  
  // Archives
  "application/zip",
  "application/x-zip-compressed",
  
  // 3D Models
  "model/gltf-binary",
  "model/gltf+json",
  "application/octet-stream", // .glb, .obj, etc.
  
  // Audio
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  
  // Source code
  "text/plain",
  "application/json",
  "text/javascript",
  "text/x-c", // C/C++ files
  "text/x-csharp", // C# files
];

// 150MB maximum file size
const MAX_FILE_SIZE = 150 * 1024 * 1024;

/**
 * Middleware to validate file uploads
 * Checks file type and size before allowing the upload
 */
export const fileValidator = (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  // Check Content-Type header
  const contentType = req.headers["content-type"];
  if (!contentType) {
    return res.status(400).json({
      message: "Missing Content-Type header"
    });
  }
  
  // Check if the content type is multipart/form-data
  if (!contentType.includes("multipart/form-data")) {
    return res.status(400).json({
      message: "Content-Type must be multipart/form-data for file uploads"
    });
  }
  
  // Check Content-Length header
  const contentLength = parseInt(req.headers["content-length"] || "0", 10);
  if (contentLength === 0) {
    return res.status(400).json({
      message: "Missing Content-Length header or empty file"
    });
  }
  
  if (contentLength > MAX_FILE_SIZE) {
    return res.status(400).json({
      message: `File too large. Maximum size allowed is ${MAX_FILE_SIZE / (1024 * 1024)}MB`
    });
  }
  
  // For more precise file type validation, we'll defer to Multer and additional processing
  // This middleware is meant as a quick sanity check before the more intensive processing
  
  // Proceed to next middleware
  next();
}; 