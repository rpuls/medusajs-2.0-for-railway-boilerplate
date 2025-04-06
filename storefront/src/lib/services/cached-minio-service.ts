import { Client } from 'minio';
import { Readable } from 'stream';

/**
 * Service for interacting with MinIO object storage with caching
 * Used for storing and retrieving digital assets
 */
export class CachedMinioService {
  private client: Client;
  private bucket: string;
  private cache: Map<string, { data: Buffer; timestamp: number }>;
  private cacheTTL: number; // Cache TTL in milliseconds

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
    
    // Initialize cache
    this.cache = new Map();
    this.cacheTTL = parseInt(process.env.MINIO_CACHE_TTL || '3600') * 1000; // Default 1 hour TTL
    
    // Periodically clean up expired cache entries
    setInterval(() => this.cleanupCache(), 60000); // Run every minute
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
    try {
      return await this.client.presignedGetObject(this.bucket, objectName, expirySeconds);
    } catch (error) {
      console.error('Error generating download URL:', error);
      throw new Error(`Failed to generate download URL: ${(error as Error).message}`);
    }
  }

  /**
   * Get an asset as a buffer with caching
   * @param objectName The object name (key) in MinIO
   * @returns A buffer containing the asset data
   */
  async getAssetBuffer(objectName: string): Promise<Buffer> {
    // Check cache first
    const cachedItem = this.cache.get(objectName);
    if (cachedItem && Date.now() - cachedItem.timestamp < this.cacheTTL) {
      console.log(`Cache hit for ${objectName}`);
      return cachedItem.data;
    }
    
    console.log(`Cache miss for ${objectName}, fetching from MinIO`);
    
    try {
      // Get the object as a stream
      const stream = await this.client.getObject(this.bucket, objectName);
      
      // Convert stream to buffer
      const chunks: Buffer[] = [];
      
      return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        stream.on('error', (err) => reject(err));
        stream.on('end', () => {
          const buffer = Buffer.concat(chunks);
          
          // Cache the result
          this.cache.set(objectName, {
            data: buffer,
            timestamp: Date.now()
          });
          
          resolve(buffer);
        });
      });
    } catch (error) {
      console.error('Error fetching asset from MinIO:', error);
      throw new Error(`Failed to fetch asset: ${(error as Error).message}`);
    }
  }

  /**
   * Get a readable stream for an asset
   * @param objectName The object name (key) in MinIO
   * @returns A readable stream of the asset
   */
  async getAssetStream(objectName: string): Promise<Readable> {
    try {
      // For streams, we don't use caching as it would require
      // buffering the entire file in memory first
      return await this.client.getObject(this.bucket, objectName);
    } catch (error) {
      console.error('Error getting asset stream:', error);
      throw new Error(`Failed to get asset stream: ${(error as Error).message}`);
    }
  }

  /**
   * Delete an asset from MinIO
   * @param objectName The object name (key) in MinIO
   */
  async deleteAsset(objectName: string): Promise<void> {
    try {
      await this.client.removeObject(this.bucket, objectName);
      
      // Remove from cache if exists
      this.cache.delete(objectName);
    } catch (error) {
      console.error('Error deleting asset:', error);
      throw new Error(`Failed to delete asset: ${(error as Error).message}`);
    }
  }

  /**
   * List all assets in a directory
   * @param prefix The directory prefix to list
   * @returns An array of object information
   */
  async listAssets(prefix = 'assets/'): Promise<any[]> {
    try {
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
    } catch (error) {
      console.error('Error listing assets:', error);
      throw new Error(`Failed to list assets: ${(error as Error).message}`);
    }
  }
  
  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('MinIO cache cleared');
  }
  
  /**
   * Clean up expired cache entries
   */
  private cleanupCache(): void {
    const now = Date.now();
    let count = 0;
    
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > this.cacheTTL) {
        this.cache.delete(key);
        count++;
      }
    }
    
    if (count > 0) {
      console.log(`Cleaned up ${count} expired cache entries`);
    }
  }
}
