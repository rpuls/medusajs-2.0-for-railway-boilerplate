"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const joiner_config_1 = require("../joiner-config");
const utils_1 = require("@medusajs/framework/utils");
class FileModuleService {
    constructor({ fileProviderService }) {
        this.fileProviderService_ = fileProviderService;
    }
    __joinerConfig() {
        return joiner_config_1.joinerConfig;
    }
    async createFiles(data) {
        const input = Array.isArray(data) ? data : [data];
        // TODO: Validate file mime type, have config for allowed types
        const files = await Promise.all(input.map((file) => this.fileProviderService_.upload(file)));
        const result = files.map((file) => ({
            id: file.key,
            url: file.url,
        }));
        return Array.isArray(data) ? result : result[0];
    }
    async deleteFiles(ids) {
        const input = Array.isArray(ids) ? ids : [ids];
        await Promise.all(input.map((id) => this.fileProviderService_.delete({ fileKey: id })));
        return;
    }
    async retrieveFile(id) {
        const res = await this.fileProviderService_.getPresignedDownloadUrl({
            fileKey: id,
        });
        return {
            id,
            url: res,
        };
    }
    async listFiles(filters, config, sharedContext) {
        const id = Array.isArray(filters?.id) ? filters?.id?.[0] : filters?.id;
        if (!id) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, "Listing of files is only supported when filtering by ID.");
        }
        const res = await this.fileProviderService_.getPresignedDownloadUrl({
            fileKey: id,
        });
        if (!res) {
            return [];
        }
        return [
            {
                id,
                url: res,
            },
        ];
    }
    async listAndCountFiles(filters, config, sharedContext) {
        const id = Array.isArray(filters?.id) ? filters?.id?.[0] : filters?.id;
        if (!id) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, "Listing and counting of files is only supported when filtering by ID.");
        }
        const res = await this.fileProviderService_.getPresignedDownloadUrl({
            fileKey: id,
        });
        if (!res) {
            return [[], 0];
        }
        return [
            [
                {
                    id,
                    url: res,
                },
            ],
            1,
        ];
    }
}
exports.default = FileModuleService;
//# sourceMappingURL=file-module-service.js.map