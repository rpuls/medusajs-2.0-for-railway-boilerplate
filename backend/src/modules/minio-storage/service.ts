import { Logger } from '@medusajs/types'
import { AbstractFileProviderService, MedusaError } from '@medusajs/framework/utils'
import { Client } from 'minio'
import { ulid } from 'ulid'

type InjectedDependencies = {
  logger: Logger
}

type Options = {
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
class MinioProviderService extends AbstractFileProviderService {
  protected readonly logger_: Logger
  protected readonly client_: Client
  protected readonly bucket_: string
  protected readonly prefix_: string
  protected readonly endpoint_: string
  protected readonly port_: number
  static identifier = 'minio'

  constructor(
    { logger }: InjectedDependencies,
    options: Options
  ) {
    super()

    this.logger_ = logger
    this.bucket_ = options.bucket
    this.prefix_ = options.prefix ?? ''
    this.endpoint_ = options.endpoint
    this.port_ = options.port

    this.client_ = new Client({
      endPoint: options.endpoint,
      port: options.port,
      useSSL: options.use_ssl ?? true,
      accessKey: options.access_key,
      secretKey: options.secret_key
    })
  }

  async upload(fileData): Promise<{ url: string; key: string }> {
    this.logger_.debug('Upload called with:', {
      hasFile: !!fileData,
      fileType: typeof fileData,
      fileKeys: fileData ? Object.keys(fileData) : []
    })

    if (!fileData) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        'No file data provided'
      )
    }

    // Handle both direct file data and multer file data
    const file = fileData.file || fileData
    this.logger_.debug('Processing file:', {
      hasBuffer: !!file?.buffer,
      originalname: file?.originalname,
      mimetype: file?.mimetype
    })

    if (!file?.buffer) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        'No file buffer provided'
      )
    }

    const fileKey = `${this.prefix_}${ulid()}${file.originalname ? `-${file.originalname}` : ''}`

    try {
      await this.client_.putObject(
        this.bucket_,
        fileKey,
        file.buffer,
        {
          'Content-Type': file.mimetype || 'application/octet-stream'
        }
      )

      const protocol = this.client_.protocol
      const fileUrl = `${protocol}//${this.endpoint_}${this.port_ === 443 ? '' : `:${this.port_}`}/${this.bucket_}/${fileKey}`

      this.logger_.debug('File uploaded successfully:', { fileUrl })

      return {
        url: fileUrl,
        key: fileKey
      }
    } catch (error) {
      this.logger_.error('Upload error:', error)
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Error uploading file to MinIO: ${error.message}`
      )
    }
  }

  async delete(file: { key: string }): Promise<void> {
    try {
      await this.client_.removeObject(this.bucket_, file.key)
    } catch (error) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Error deleting file from MinIO: ${error.message}`
      )
    }
  }

  async getPresignedDownloadUrl(fileData: { key: string }): Promise<string> {
    try {
      return await this.client_.presignedGetObject(
        this.bucket_,
        fileData.key,
        60 * 60 // 1 hour expiry
      )
    } catch (error) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Error generating presigned URL: ${error.message}`
      )
    }
  }
}

export default MinioProviderService
