/**
 * Digital Assets API Routes
 */
import { Router } from "express";
import { uploadAsset, getAsset, listAssets } from "./handlers";
import multer from "multer";
import { assetUploadRateLimiter } from "../../../middlewares/rate-limiter";
import { fileValidator } from "../../../middlewares/file-validator";

// Configure multer storage and limits
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 150 * 1024 * 1024, // 150MB max file size
  }
});

// Custom wrapper for route handlers
const wrapHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res);
  } catch (error) {
    next(error);
  }
};

export default (router) => {
  const assetRouter = Router();
  router.use("/assets", assetRouter);

  // Added rate limiter and file validator middleware
  assetRouter.post(
    "/upload", 
    assetUploadRateLimiter, 
    fileValidator,
    upload.single("file"), 
    wrapHandler(uploadAsset)
  );
  
  assetRouter.get("/:id", wrapHandler(getAsset));
  assetRouter.get("/", wrapHandler(listAssets));

  return router;
};
