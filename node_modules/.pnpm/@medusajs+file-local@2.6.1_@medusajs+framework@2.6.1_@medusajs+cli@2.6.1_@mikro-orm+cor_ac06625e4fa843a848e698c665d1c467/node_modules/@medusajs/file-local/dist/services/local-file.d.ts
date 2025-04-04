import { FileTypes, LocalFileServiceOptions } from "@medusajs/framework/types";
import { AbstractFileProviderService } from "@medusajs/framework/utils";
export declare class LocalFileService extends AbstractFileProviderService {
    static identifier: string;
    protected uploadDir_: string;
    protected privateUploadDir_: string;
    protected backendUrl_: string;
    constructor(_: any, options: LocalFileServiceOptions);
    upload(file: FileTypes.ProviderUploadFileDTO): Promise<FileTypes.ProviderFileResultDTO>;
    delete(file: FileTypes.ProviderDeleteFileDTO): Promise<void>;
    getPresignedDownloadUrl(file: FileTypes.ProviderGetFileDTO): Promise<string>;
    private getUploadFilePath;
    private getUploadFileUrl;
    private ensureDirExists;
}
//# sourceMappingURL=local-file.d.ts.map