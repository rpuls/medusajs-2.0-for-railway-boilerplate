import { Request, Response } from "express";

/**
 * Upload a digital asset
 */
export async function uploadAsset(req: Request, res: Response): Promise<void> {
  const { productId } = req.body;
  const file = req.file;

  if (!file) {
    res.status(400).json({ message: "No file provided" });
    return;
  }

  if (!productId) {
    res.status(400).json({ message: "Product ID is required" });
    return;
  }

  try {
    const minioAssetService = req.scope.resolve("minioAssetService");

    const asset = await minioAssetService.uploadAsset(
      file.buffer,
      file.originalname,
      file.mimetype,
      productId
    );

    res.status(201).json({ asset });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/**
 * Get a digital asset by ID
 */
export async function getAsset(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    const minioAssetService = req.scope.resolve("minioAssetService");

    // Get the download URL
    const downloadUrl = await minioAssetService.getAssetDownloadUrl(id);

    res.status(200).json({ download_url: downloadUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

/**
 * List digital assets for a product
 */
export async function listAssets(req: Request, res: Response): Promise<void> {
  const { product_id } = req.query;

  if (!product_id) {
    res.status(400).json({ message: "Product ID is required" });
    return;
  }

  try {
    const minioAssetService = req.scope.resolve("minioAssetService");

    const assets = await minioAssetService.getAssetsByProductId(product_id as string);

    res.status(200).json({ assets });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
