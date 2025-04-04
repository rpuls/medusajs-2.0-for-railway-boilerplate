"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3FileService = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const utils_1 = require("@medusajs/framework/utils");
const path_1 = __importDefault(require("path"));
const ulid_1 = require("ulid");
class S3FileService extends utils_1.AbstractFileProviderService {
    constructor({ logger }, options) {
        super();
        const authenticationMethod = options.authentication_method ?? "access-key";
        if (authenticationMethod === "access-key" &&
            (!options.access_key_id || !options.secret_access_key)) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Access key ID and secret access key are required when using access key authentication`);
        }
        this.config_ = {
            fileUrl: options.file_url,
            accessKeyId: options.access_key_id,
            secretAccessKey: options.secret_access_key,
            authenticationMethod: authenticationMethod,
            region: options.region,
            bucket: options.bucket,
            prefix: options.prefix ?? "",
            endpoint: options.endpoint,
            cacheControl: options.cache_control ?? "public, max-age=31536000",
            downloadFileDuration: options.download_file_duration ?? 60 * 60,
            additionalClientConfig: options.additional_client_config ?? {},
        };
        this.logger_ = logger;
        this.client_ = this.getClient();
    }
    getClient() {
        // If none is provided, the SDK will use the default credentials provider chain, see https://docs.aws.amazon.com/cli/v1/userguide/cli-configure-envvars.html
        const credentials = this.config_.authenticationMethod === "access-key"
            ? {
                accessKeyId: this.config_.accessKeyId,
                secretAccessKey: this.config_.secretAccessKey,
            }
            : undefined;
        const config = {
            credentials,
            region: this.config_.region,
            endpoint: this.config_.endpoint,
            ...this.config_.additionalClientConfig,
        };
        return new client_s3_1.S3Client(config);
    }
    async upload(file) {
        if (!file) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `No file provided`);
        }
        if (!file.filename) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `No filename provided`);
        }
        const parsedFilename = path_1.default.parse(file.filename);
        // TODO: Allow passing a full path for storage per request, not as a global config.
        const fileKey = `${this.config_.prefix}${parsedFilename.name}-${(0, ulid_1.ulid)()}${parsedFilename.ext}`;
        const content = Buffer.from(file.content, "binary");
        const command = new client_s3_1.PutObjectCommand({
            // We probably also want to support a separate bucket altogether for private files
            // protected private_bucket_: string
            // protected private_access_key_id_: string
            // protected private_secret_access_key_: string
            ACL: file.access === "public" ? "public-read" : "private",
            Bucket: this.config_.bucket,
            Body: content,
            Key: fileKey,
            ContentType: file.mimeType,
            CacheControl: this.config_.cacheControl,
            // Note: We could potentially set the content disposition when uploading,
            // but storing the original filename as metadata should suffice.
            Metadata: {
                "x-amz-meta-original-filename": file.filename,
            },
        });
        try {
            await this.client_.send(command);
        }
        catch (e) {
            this.logger_.error(e);
            throw e;
        }
        return {
            url: `${this.config_.fileUrl}/${fileKey}`,
            key: fileKey,
        };
    }
    async delete(file) {
        const command = new client_s3_1.DeleteObjectCommand({
            Bucket: this.config_.bucket,
            Key: file.fileKey,
        });
        try {
            await this.client_.send(command);
        }
        catch (e) {
            // TODO: Rethrow depending on the error (eg. a file not found error is fine, but a failed request should be rethrown)
            this.logger_.error(e);
        }
    }
    async getPresignedDownloadUrl(fileData) {
        // TODO: Allow passing content disposition when getting a presigned URL
        const command = new client_s3_1.GetObjectCommand({
            Bucket: this.config_.bucket,
            Key: `${fileData.fileKey}`,
        });
        return await (0, s3_request_presigner_1.getSignedUrl)(this.client_, command, {
            expiresIn: this.config_.downloadFileDuration,
        });
    }
}
exports.S3FileService = S3FileService;
S3FileService.identifier = "s3";
//# sourceMappingURL=s3-file.js.map