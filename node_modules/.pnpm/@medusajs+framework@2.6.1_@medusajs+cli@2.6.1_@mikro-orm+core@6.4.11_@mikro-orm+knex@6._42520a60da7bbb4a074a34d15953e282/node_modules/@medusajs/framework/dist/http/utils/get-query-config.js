"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pickByConfig = pickByConfig;
exports.prepareListQuery = prepareListQuery;
exports.prepareRetrieveQuery = prepareRetrieveQuery;
const utils_1 = require("@medusajs/utils");
const lodash_1 = require("lodash");
function pickByConfig(obj, config) {
    const fields = [...(config.select ?? []), ...(config.relations ?? [])];
    if (fields.length) {
        if (Array.isArray(obj)) {
            return obj.map((o) => (0, lodash_1.pick)(o, fields));
        }
        else {
            return (0, lodash_1.pick)(obj, fields);
        }
    }
    return obj;
}
function checkRestrictedFields({ fields, restricted, }) {
    const notAllowedFields = [];
    fields.forEach((field) => {
        const fieldSegments = field.split(".");
        const hasRestrictedField = restricted.some((restrictedField) => fieldSegments.includes(restrictedField));
        if (hasRestrictedField) {
            notAllowedFields.push(field);
            return;
        }
        return;
    });
    return notAllowedFields;
}
function checkAllowedFields({ fields, allowed, starFields, }) {
    const notAllowedFields = [];
    fields.forEach((field) => {
        const hasAllowedField = allowed.includes(field);
        if (hasAllowedField) {
            return;
        }
        // Select full relation in that case it must match an allowed field fully
        // e.g product.variants in that case we must have a product.variants in the allowedFields
        if (starFields.has(field)) {
            if (hasAllowedField) {
                return;
            }
            notAllowedFields.push(field);
            return;
        }
        const fieldStartsWithAllowedField = allowed.some((allowedField) => field.startsWith(allowedField));
        if (!fieldStartsWithAllowedField) {
            notAllowedFields.push(field);
            return;
        }
    });
    return notAllowedFields;
}
function prepareListQuery(validated, queryConfig = {}) {
    let { allowed = [], restricted = [], defaults = [], defaultLimit = 50, isList, } = queryConfig;
    const { order, fields, limit = defaultLimit, offset = 0 } = validated;
    // e.g *product.variants meaning that we want all fields from the product.variants
    // in that case it wont be part of the select but it will be part of the relations.
    // For the remote query we will have to add the fields to the fields array as product.variants.*
    const starFields = new Set();
    let allFields = new Set(defaults);
    if ((0, utils_1.isDefined)(fields)) {
        const customFields = fields.split(",").filter(Boolean);
        const shouldReplaceDefaultFields = !customFields.length ||
            customFields.some((field) => {
                return !(field.startsWith("-") ||
                    field.startsWith("+") ||
                    field.startsWith(" ") ||
                    field.startsWith("*") ||
                    field.endsWith(".*"));
            });
        if (shouldReplaceDefaultFields) {
            allFields = new Set(customFields.map((f) => f.replace(/^[+ -]/, "")));
        }
        else {
            customFields.forEach((field) => {
                if (field.startsWith("+") || field.startsWith(" ")) {
                    allFields.add(field.trim().replace(/^\+/, ""));
                }
                else if (field.startsWith("-")) {
                    const fieldName = field.replace(/^-/, "");
                    for (const reqField of allFields) {
                        const reqFieldName = reqField.replace(/^\*/, "");
                        if (reqFieldName === fieldName ||
                            reqFieldName.startsWith(fieldName + ".")) {
                            allFields.delete(reqField);
                        }
                    }
                }
                else {
                    allFields.add(field);
                }
            });
        }
        allFields.add("id");
    }
    allFields.forEach((field) => {
        if (field.startsWith("*") || field.endsWith(".*")) {
            starFields.add(field.replace(/(^\*|\.\*$)/, ""));
            allFields.delete(field);
        }
    });
    let notAllowedFields = [];
    if (allowed.length || restricted.length) {
        const fieldsToCheck = [...allFields, ...Array.from(starFields)];
        if (allowed.length) {
            notAllowedFields = checkAllowedFields({
                fields: fieldsToCheck,
                starFields,
                allowed,
            });
        }
        else if (restricted.length) {
            notAllowedFields = checkRestrictedFields({
                fields: fieldsToCheck,
                restricted,
            });
        }
    }
    if (notAllowedFields.length) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Requested fields [${Array.from(notAllowedFields).join(", ")}] are not valid`);
    }
    // TODO: maintain backward compatibility, remove in the future
    const { select, relations } = (0, utils_1.stringToSelectRelationObject)(Array.from(allFields));
    let allRelations = new Set([...relations, ...Array.from(starFields)]);
    // End of expand compatibility
    let orderBy = {};
    if ((0, utils_1.isDefined)(order)) {
        let orderField = order;
        if (order.startsWith("-")) {
            const [, field] = order.split("-");
            orderField = field;
            orderBy = { [field]: "DESC" };
        }
        else {
            orderBy = { [order]: "ASC" };
        }
        if (allowed.length && !allowed.includes(orderField)) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Order field ${orderField} is not valid`);
        }
    }
    const finalOrder = (0, utils_1.isPresent)(orderBy) ? orderBy : undefined;
    return {
        listConfig: {
            select: select.length ? select : undefined,
            relations: Array.from(allRelations),
            skip: offset,
            take: limit,
            order: finalOrder,
        },
        remoteQueryConfig: {
            // Add starFields that are relations only on which we want all properties with a dedicated format to the remote query
            fields: [
                ...Array.from(allFields),
                ...Array.from(starFields).map((f) => `${f}.*`),
            ],
            pagination: isList
                ? {
                    skip: offset,
                    take: limit,
                    order: finalOrder,
                }
                : {},
        },
    };
}
function prepareRetrieveQuery(validated, queryConfig) {
    const { listConfig, remoteQueryConfig } = prepareListQuery(validated, queryConfig);
    return {
        retrieveConfig: {
            select: listConfig.select,
            relations: listConfig.relations,
        },
        remoteQueryConfig: {
            fields: remoteQueryConfig.fields,
            pagination: {},
        },
    };
}
//# sourceMappingURL=get-query-config.js.map