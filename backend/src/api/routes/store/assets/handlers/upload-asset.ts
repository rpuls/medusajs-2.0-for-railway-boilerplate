import { Request, Response } from "express";
import { MedusaError } from "medusa-core-utils";

/**
 * @api {post} /store/assets/upload Upload a digital asset
 * @apiDescription Uploads a digital asset and associates it with a product
 * @apiGroup DigitalAssets
 * @apiParam {File} file The file to upload
 * @apiParam {String} product_id The product ID to associate the asset with
 * @apiParam {Object} [metadata] Additional metadata for the asset
 */
export default async (req: Request, res: Response) => {
  const { product_id, metadata } = req.body;
  const file = req.file;
  
  if (!file) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "No file uploaded"
    );
  }
  
  if (!product_id) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "product_id is required"
    );
  }
  
  try {
    const digitaAssetService = req.scope.resolve("digitalAssetService");
    const fileScanService = req.scope.resolve("fileScanService");
    
    // Scan the file for malware/viruses
    const scanResult = await fileScanService.scanFile({
      buffer: file.buffer,
      fileName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size
    });
    
    // If file is not safe, reject the upload
    if (!scanResult.isSafe) {
      return res.status(400).json({
        error: "File rejected by security scan",
        details: scanResult.threatType || "Unknown threat detected"
      });
    }
    
    // Save AI detection result in metadata if available
    const assetMetadata = {
      originalName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      ...(metadata || {}),
    };
    
    if (scanResult.isAiGenerated !== undefined) {
      assetMetadata.isAiGenerated = scanResult.isAiGenerated;
    }
    
    // Create digital asset
    const digitalAsset = await digitaAssetService.create({
      product_id,
      file,
      metadata: assetMetadata
    });
    
    return res.status(201).json({ asset: digitalAsset });
  } catch (error) {
    console.error("Error uploading asset:", error);
    
    if (error instanceof MedusaError) {
      throw error;
    }
    
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "An error occurred during file upload"
    );
  }
}; 