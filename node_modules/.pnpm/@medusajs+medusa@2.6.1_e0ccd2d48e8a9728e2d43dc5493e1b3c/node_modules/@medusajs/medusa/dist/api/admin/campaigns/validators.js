"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminUpdateCampaign = exports.UpdateCampaign = exports.AdminCreateCampaign = exports.CreateCampaign = exports.UpdateCampaignBudget = exports.AdminGetCampaignsParams = exports.AdminGetCampaignsParamsFields = exports.AdminGetCampaignParams = void 0;
const utils_1 = require("@medusajs/framework/utils");
const zod_1 = require("zod");
const validators_1 = require("../../utils/validators");
const common_validators_1 = require("../../utils/common-validators");
exports.AdminGetCampaignParams = (0, validators_1.createSelectParams)();
exports.AdminGetCampaignsParamsFields = zod_1.z
    .object({
    q: zod_1.z.string().optional(),
    campaign_identifier: zod_1.z.string().optional(),
    budget: zod_1.z
        .object({
        currency_code: zod_1.z.string().optional(),
    })
        .optional(),
})
    .strict();
exports.AdminGetCampaignsParams = (0, validators_1.createFindParams)({
    offset: 0,
    limit: 50,
})
    .merge(exports.AdminGetCampaignsParamsFields)
    .merge((0, common_validators_1.applyAndAndOrOperators)(exports.AdminGetCampaignsParamsFields).strict());
const CreateCampaignBudget = zod_1.z
    .object({
    type: zod_1.z.nativeEnum(utils_1.CampaignBudgetType),
    limit: zod_1.z.number().nullish(),
    currency_code: zod_1.z.string().nullish(),
})
    .strict()
    .refine((data) => data.type !== utils_1.CampaignBudgetType.SPEND || (0, utils_1.isPresent)(data.currency_code), {
    path: ["currency_code"],
    message: `currency_code is required when budget type is ${utils_1.CampaignBudgetType.SPEND}`,
})
    .refine((data) => data.type !== utils_1.CampaignBudgetType.USAGE || !(0, utils_1.isPresent)(data.currency_code), {
    path: ["currency_code"],
    message: `currency_code should not be present when budget type is ${utils_1.CampaignBudgetType.USAGE}`,
});
exports.UpdateCampaignBudget = zod_1.z
    .object({
    limit: zod_1.z.number().nullish(),
})
    .strict();
exports.CreateCampaign = zod_1.z
    .object({
    name: zod_1.z.string(),
    campaign_identifier: zod_1.z.string(),
    description: zod_1.z.string().nullish(),
    budget: CreateCampaignBudget.nullish(),
    starts_at: zod_1.z.coerce.date().nullish(),
    ends_at: zod_1.z.coerce.date().nullish(),
})
    .strict();
exports.AdminCreateCampaign = (0, validators_1.WithAdditionalData)(exports.CreateCampaign);
exports.UpdateCampaign = zod_1.z.object({
    name: zod_1.z.string().optional(),
    campaign_identifier: zod_1.z.string().optional(),
    description: zod_1.z.string().nullish(),
    budget: exports.UpdateCampaignBudget.optional(),
    starts_at: zod_1.z.coerce.date().nullish(),
    ends_at: zod_1.z.coerce.date().nullish(),
});
exports.AdminUpdateCampaign = (0, validators_1.WithAdditionalData)(exports.UpdateCampaign);
//# sourceMappingURL=validators.js.map