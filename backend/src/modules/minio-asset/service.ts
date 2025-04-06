import { EntityManager } from "typeorm";
import { Client } from "minio";
import { Logger } from "@medusajs/types";
import { DigitalAsset, ReviewStatus } from "../../models/digital-asset";
import { generateEntityId } from "@medusajs/utils";

// Define a simplified TransactionBaseService since we can't import it directly
class TransactionBaseService {
  protected readonly container: Record<string, any>;

  constructor(container) {
    this.container = container;
  }

  withTransaction(transactionManager?: EntityManager): this {
    if (!transactionManager) {
      return this;
    }

    const cloned = new (this.constructor as any)(this.container);
    cloned.transactionManager_ = transactionManager;
    return cloned;
  }
}

type InjectedDependencies = {
  manager: EntityManager;
  logger: Logger;
};

class MinioAssetService extends TransactionBaseService {
  static identifier = "minio-asset"
  
  protected manager_: EntityManager;
  protected transactionManager_: EntityManager;
  protected logger_: Logger;
  protected minioClient_: Client;
  protected bucket_: string;

  constructor(container: InjectedDependencies, options) {
    super(container);

    this.manager_ = container.manager;
    this.logger_ = container.logger;

    // Initialize MinIO client
    this.minioClient_ = new Client({
      endPoint: options.endPoint,
      port: options.port || 9000,
      useSSL: options.useSSL !== undefined ? options.useSSL : true,
      accessKey: options.accessKey,
      secretKey: options.secretKey
    });

    this.bucket_ = options.bucket || "medusa-assets";

    // Ensure bucket exists
    this.initBucket().catch(err => {
      this.logger_.error(`Failed to initialize MinIO bucket: ${err.message}`);
    });
  }

  private async initBucket(): Promise<void> {
    try {
      const exists = await this.minioClient_.bucketExists(this.bucket_);
      if (!exists) {
        await this.minioClient_.makeBucket(this.bucket_, "us-east-1");
        this.logger_.info(`Created MinIO bucket: ${this.bucket_}`);

        // Set bucket policy for public read access
        const policy = {
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Principal: "*",
              Action: ["s3:GetObject"],
              Resource: [`arn:aws:s3:::${this.bucket_}/*`]
            }
          ]
        };

        await this.minioClient_.setBucketPolicy(this.bucket_, JSON.stringify(policy));
        this.logger_.info(`Set public read policy for bucket: ${this.bucket_}`);
      } else {
        this.logger_.info(`Using existing MinIO bucket: ${this.bucket_}`);
      }
    } catch (error) {
      this.logger_.error(`Error initializing MinIO bucket: ${error.message}`);
      throw error;
    }
  }

  async uploadAsset(fileBuffer: Buffer, fileName: string, mimeType: string, productId: string): Promise<DigitalAsset> {
    const manager = this.transactionManager_ || this.manager_;

    try {
      // Generate a unique file key
      const fileKey = `${productId}/${Date.now()}-${fileName}`;

      // Upload file to MinIO
      await this.minioClient_.putObject(
        this.bucket_,
        fileKey,
        fileBuffer,
        fileBuffer.length,
        {
          "Content-Type": mimeType,
          "x-amz-meta-original-filename": fileName
        }
      );

      // Create digital asset record
      const digitalAsset = new DigitalAsset();
      digitalAsset.id = generateEntityId(undefined, "dast");
      digitalAsset.file_key = fileKey;
      digitalAsset.file_name = fileName;
      digitalAsset.mime_type = mimeType;
      digitalAsset.file_size = fileBuffer.length;
      digitalAsset.product_id = productId;
      digitalAsset.review_status = ReviewStatus.PENDING;

      await manager.save(digitalAsset);

      this.logger_.info(`Uploaded asset ${fileKey} for product ${productId}`);

      return digitalAsset;
    } catch (error) {
      this.logger_.error(`Error uploading asset: ${error.message}`);
      throw error;
    }
  }

  async getAssetDownloadUrl(assetId: string): Promise<string> {
    const manager = this.transactionManager_ || this.manager_;

    try {
      // Find the digital asset
      const digitalAsset = await manager.findOne(DigitalAsset, {
        where: { id: assetId }
      });

      if (!digitalAsset) {
        throw new Error(`Digital asset with id ${assetId} not found`);
      }

      // Generate a presigned URL for download (valid for 24 hours)
      const url = await this.minioClient_.presignedGetObject(
        this.bucket_,
        digitalAsset.file_key,
        24 * 60 * 60
      );

      return url;
    } catch (error) {
      this.logger_.error(`Error generating download URL: ${error.message}`);
      throw error;
    }
  }

  async deleteAsset(assetId: string): Promise<void> {
    const manager = this.transactionManager_ || this.manager_;

    try {
      // Find the digital asset
      const digitalAsset = await manager.findOne(DigitalAsset, {
        where: { id: assetId }
      });

      if (!digitalAsset) {
        throw new Error(`Digital asset with id ${assetId} not found`);
      }

      // Delete the file from MinIO
      await this.minioClient_.removeObject(this.bucket_, digitalAsset.file_key);

      // Delete the digital asset record
      await manager.remove(digitalAsset);

      this.logger_.info(`Deleted asset ${digitalAsset.file_key}`);
    } catch (error) {
      this.logger_.error(`Error deleting asset: ${error.message}`);
      throw error;
    }
  }

  async getAssetsByProductId(productId: string): Promise<DigitalAsset[]> {
    const manager = this.transactionManager_ || this.manager_;

    try {
      const assets = await manager.find(DigitalAsset, {
        where: { product_id: productId }
      });

      return assets;
    } catch (error) {
      this.logger_.error(`Error fetching assets for product ${productId}: ${error.message}`);
      throw error;
    }
  }

  async updateAssetReviewStatus(assetId: string, status: ReviewStatus): Promise<DigitalAsset> {
    const manager = this.transactionManager_ || this.manager_;

    try {
      const digitalAsset = await manager.findOne(DigitalAsset, {
        where: { id: assetId }
      });

      if (!digitalAsset) {
        throw new Error(`Digital asset with id ${assetId} not found`);
      }

      digitalAsset.review_status = status;
      await manager.save(digitalAsset);

      this.logger_.info(`Updated asset ${assetId} review status to ${status}`);

      return digitalAsset;
    } catch (error) {
      this.logger_.error(`Error updating asset review status: ${error.message}`);
      throw error;
    }
  }
}

export default MinioAssetService; 