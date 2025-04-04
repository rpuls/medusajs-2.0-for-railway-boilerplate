"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const utils_1 = require("@medusajs/framework/utils");
const POST = async (req, res) => {
    const input = req.files;
    if (!input?.length) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, "No files were uploaded");
    }
    const { result } = await (0, core_flows_1.uploadFilesWorkflow)(req.scope).run({
        input: {
            files: input?.map((f) => ({
                filename: f.originalname,
                mimeType: f.mimetype,
                content: f.buffer.toString("binary"),
                access: "public",
            })),
        },
    });
    res.status(200).json({ files: result });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map