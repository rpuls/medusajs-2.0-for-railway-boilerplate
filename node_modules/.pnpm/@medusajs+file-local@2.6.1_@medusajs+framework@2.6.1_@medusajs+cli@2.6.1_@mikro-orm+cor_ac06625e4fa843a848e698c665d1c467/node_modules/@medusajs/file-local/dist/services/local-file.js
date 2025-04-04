"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalFileService = void 0;
const utils_1 = require("@medusajs/framework/utils");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
class LocalFileService extends utils_1.AbstractFileProviderService {
    constructor(_, options) {
        super();
        this.getUploadFilePath = (baseDir, fileKey) => {
            return path_1.default.join(baseDir, fileKey);
        };
        this.getUploadFileUrl = (fileKey) => {
            const baseUrl = new URL(this.backendUrl_);
            baseUrl.pathname = path_1.default.join(baseUrl.pathname, fileKey);
            return baseUrl.href;
        };
        this.uploadDir_ = options?.upload_dir || path_1.default.join(process.cwd(), "static");
        // Since there is no way to serve private files through a static server, we simply place them in `static`.
        // This means that the files will be available publicly if the filename is known. Since the local file provider
        // is for development only, this shouldn't be an issue. If you really want to use it in production (and you shouldn't)
        // You can change the private upload dir to `/private` but none of the functionalities where you use a presigned URL will work.
        this.privateUploadDir_ =
            options?.private_upload_dir || path_1.default.join(process.cwd(), "static");
        this.backendUrl_ = options?.backend_url || "http://localhost:9000/static";
    }
    async upload(file) {
        if (!file) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `No file provided`);
        }
        if (!file.filename) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `No filename provided`);
        }
        const parsedFilename = path_1.default.parse(file.filename);
        const baseDir = file.access === "public" ? this.uploadDir_ : this.privateUploadDir_;
        await this.ensureDirExists(baseDir, parsedFilename.dir);
        const fileKey = path_1.default.join(parsedFilename.dir, 
        // We prepend "private" to the file key so deletions and presigned URLs can know which folder to look into
        `${file.access === "public" ? "" : "private-"}${Date.now()}-${parsedFilename.base}`);
        const filePath = this.getUploadFilePath(baseDir, fileKey);
        const fileUrl = this.getUploadFileUrl(fileKey);
        const content = Buffer.from(file.content, "binary");
        await promises_1.default.writeFile(filePath, content);
        return {
            key: fileKey,
            url: fileUrl,
        };
    }
    async delete(file) {
        const baseDir = file.fileKey.startsWith("private-")
            ? this.privateUploadDir_
            : this.uploadDir_;
        const filePath = this.getUploadFilePath(baseDir, file.fileKey);
        try {
            await promises_1.default.access(filePath, promises_1.default.constants.W_OK);
            await promises_1.default.unlink(filePath);
        }
        catch (e) {
            // The file does not exist, we don't do anything
            if (e.code !== "ENOENT") {
                throw e;
            }
        }
        return;
    }
    // The local file provider doesn't support presigned URLs for private files (i.e files not placed in /static).
    async getPresignedDownloadUrl(file) {
        const isPrivate = file.fileKey.startsWith("private-");
        const baseDir = isPrivate ? this.privateUploadDir_ : this.uploadDir_;
        const filePath = this.getUploadFilePath(baseDir, file.fileKey);
        try {
            await promises_1.default.access(filePath, promises_1.default.constants.F_OK);
        }
        catch {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `File with key ${file.fileKey} not found`);
        }
        return this.getUploadFileUrl(file.fileKey);
    }
    async ensureDirExists(baseDir, dirPath) {
        const relativePath = path_1.default.join(baseDir, dirPath);
        try {
            await promises_1.default.access(relativePath, promises_1.default.constants.F_OK);
        }
        catch (e) {
            await promises_1.default.mkdir(relativePath, { recursive: true });
        }
        return relativePath;
    }
}
exports.LocalFileService = LocalFileService;
LocalFileService.identifier = "localfs";
//# sourceMappingURL=local-file.js.map