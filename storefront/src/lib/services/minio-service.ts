import { Client } from 'minio';
import { Readable } from 'stream';

/**
 * Service for interacting with MinIO object storage
 * Used for storing and retrieving digital assets
 */
export class MinioService {
  private client: Client;
  private bucket: string;

  constructor() {
    // Initialize MinIO client
    this.client = new Client({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT || '9000'),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    });

    this.bucket = process.env.MINIO_BUCKET || 'digital-assets';
  }

  /**
   * Upload a file to MinIO
   * @param file The file buffer to upload
   * @param fileName The name of the file
   * @param mimeType The MIME type of the file
   * @returns The object name (key) in MinIO
   */
  async uploadAsset(file: Buffer, fileName: string, mimeType: string): Promise<string> {
    try {
      // Generate a unique object name
      const objectName = `assets/${Date.now()}-${fileName}`;

      // Check if bucket exists, create if it doesn't
      try {
        const bucketExists = await this.client.bucketExists(this.bucket);
        if (!bucketExists) {
          console.log(`Creating bucket: ${this.bucket}`);
          await this.client.makeBucket(this.bucket, 'us-east-1');
        }
      } catch (bucketError) {
        console.error('Error checking/creating bucket:', bucketError);
        throw new Error(`Failed to access or create bucket: ${(bucketError as Error).message}`);
      }

      // Upload the file
      await this.client.putObject(this.bucket, objectName, file, {
        'Content-Type': mimeType,
      });

      console.log(`File uploaded successfully: ${objectName}`);
      return objectName;
    } catch (error) {
      console.error('Error uploading asset to MinIO:', error);
      throw new Error(`Failed to upload asset: ${(error as Error).message}`);
    }
  }

  /**
   * Get a download URL for an asset
   * @param objectName The object name (key) in MinIO
   * @param expirySeconds How long the URL should be valid for (in seconds)
   * @returns A presigned URL for downloading the asset
   */
  async getAssetDownloadUrl(objectName: string, expirySeconds = 3600): Promise<string> {
    return await this.client.presignedGetObject(this.bucket, objectName, expirySeconds);
  }

  /**
   * Get a readable stream for an asset
   * @param objectName The object name (key) in MinIO
   * @returns A readable stream of the asset
   */
  async getAssetStream(objectName: string): Promise<Readable> {
    return await this.client.getObject(this.bucket, objectName);
  }

  /**
   * Delete an asset from MinIO
   * @param objectName The object name (key) in MinIO
   */
  async deleteAsset(objectName: string): Promise<void> {
    await this.client.removeObject(this.bucket, objectName);
  }

  /**
   * List all assets in a directory
   * @param prefix The directory prefix to list
   * @returns An array of object information
   */
  async listAssets(prefix = 'assets/'): Promise<any[]> {
    const objectsStream = this.client.listObjects(this.bucket, prefix, true);

    return new Promise((resolve, reject) => {
      const objects: any[] = [];

      objectsStream.on('data', (obj) => {
        objects.push(obj);
      });

      objectsStream.on('error', (err) => {
        reject(err);
      });

      objectsStream.on('end', () => {
        resolve(objects);
      });
    });
  }
}
