import { S3Client } from "@aws-sdk/client-s3";
import { FileTypes, Logger, S3FileServiceOptions } from "@medusajs/framework/types";
import { AbstractFileProviderService } from "@medusajs/framework/utils";
type InjectedDependencies = {
    logger: Logger;
};
interface S3FileServiceConfig {
    fileUrl: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    authenticationMethod?: "access-key" | "s3-iam-role";
    region: string;
    bucket: string;
    prefix?: string;
    endpoint?: string;
    cacheControl?: string;
    downloadFileDuration?: number;
    additionalClientConfig?: Record<string, any>;
}
export declare class S3FileService extends AbstractFileProviderService {
    static identifier: string;
    protected config_: S3FileServiceConfig;
    protected logger_: Logger;
    protected client_: S3Client;
    constructor({ logger }: InjectedDependencies, options: S3FileServiceOptions);
    protected getClient(): S3Client;
    upload(file: FileTypes.ProviderUploadFileDTO): Promise<FileTypes.ProviderFileResultDTO>;
    delete(file: FileTypes.ProviderDeleteFileDTO): Promise<void>;
    getPresignedDownloadUrl(fileData: FileTypes.ProviderGetFileDTO): Promise<string>;
}
export {};
//# sourceMappingURL=s3-file.d.ts.map