import { Logger } from '@medusajs/types'
import { AbstractFileService, MedusaError } from '@medusajs/utils'
import { Client } from 'minio'
import path from 'path'
import { ulid } from 'ulid'

type InjectedDependencies = {
  logger: Logger
}

interface MinioServiceConfig {
  endPoint: string
  port: number
  useSSL: boolean
  accessKey: string
  secretKey: string
  bucket: string
  prefix?: string
}

export interface MinioStorageServiceOptions {
  endpoint: string
  port: number
  use_ssl?: boolean
  access_key: string
  secret_key: string
  bucket: string
  prefix?: string
}

/**
 * Service to handle file storage using MinIO.
 */
export class MinioStorageService extends AbstractFileService {
  static identifier = 'minio'

  protected readonly config_: MinioServiceConfig
  protected readonly logger_: Logger
  protected client_: Client

  constructor(
    { logger }: InjectedDependencies,
    options: MinioStorageServiceOptions
  ) {
    super()

    this.config_ = {
      endPoint: options.endpoint,
      port: options.port,
      useSSL: options.use_ssl ?? true,
      accessKey: options.access_key,
      secretKey: options.secret_key,
      bucket: options.bucket,
      prefix: options.prefix ?? ''
    }
    
    this.logger_ = logger
    this.client_ = new Client({
      endPoint: this.config_.endPoint,
      port: this.config_.port,
      useSSL: this.config_.useSSL,
      accessKey: this.config_.accessKey,
      secretKey: this.config_.secretKey
    })
  }

  async upload(fileData: Express.Multer.File): Promise<{ url: string; key: string }> {
    if (!fileData) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        'No file data provided'
      )
    }

    const parsedFilename = path.parse(fileData.originalname)
    const fileKey = `${this.config_.prefix}${parsedFilename.name}-${ulid()}${parsedFilename.ext}`

    try {
      await this.client_.putObject(
        this.config_.bucket,
        fileKey,
        fileData.buffer,
        {
          'Content-Type': fileData.mimetype,
          'x-amz-meta-original-filename': fileData.originalname
        }
      )

      this.logger_.info(`Uploaded file ${fileKey} to MinIO bucket ${this.config_.bucket}`)

      return {
        url: `${this.config_.useSSL ? 'https' : 'http'}://${this.config_.endPoint}:${this.config_.port}/${this.config_.bucket}/${fileKey}`,
        key: fileKey
      }
    } catch (error) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Error uploading file to MinIO: ${error.message}`
      )
    }
  }

  async delete(fileData: { key: string }): Promise<void> {
    try {
      await this.client_.removeObject(this.config_.bucket, fileData.key)
      this.logger_.info(`Deleted file ${fileData.key} from MinIO bucket ${this.config_.bucket}`)
    } catch (error) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Error deleting file from MinIO: ${error.message}`
      )
    }
  }

  async getUploadStreamDescriptor(fileData: { name: string; ext?: string; acl?: string }): Promise<{ writeStream: any; promise: Promise<any>; url: string; fileKey: string }> {
    const parsedFilename = path.parse(fileData.name)
    const fileKey = `${this.config_.prefix}${parsedFilename.name}-${ulid()}${fileData.ext || parsedFilename.ext}`
    const url = `${this.config_.useSSL ? 'https' : 'http'}://${this.config_.endPoint}:${this.config_.port}/${this.config_.bucket}/${fileKey}`

    return {
      writeStream: await this.client_.putObject(this.config_.bucket, fileKey, null),
      promise: Promise.resolve(),
      url,
      fileKey
    }
  }

  async getDownloadStream(fileData: { key: string }): Promise<NodeJS.ReadableStream> {
    try {
      return await this.client_.getObject(this.config_.bucket, fileData.key)
    } catch (error) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Error getting download stream from MinIO: ${error.message}`
      )
    }
  }

  async getPresignedDownloadUrl(fileData: { key: string; expiresIn?: number }): Promise<string> {
    try {
      return await this.client_.presignedGetObject(
        this.config_.bucket,
        fileData.key,
        fileData.expiresIn ?? 3600 // Default 1 hour
      )
    } catch (error) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Error generating presigned URL: ${error.message}`
      )
    }
  }
}

export default MinioStorageService
