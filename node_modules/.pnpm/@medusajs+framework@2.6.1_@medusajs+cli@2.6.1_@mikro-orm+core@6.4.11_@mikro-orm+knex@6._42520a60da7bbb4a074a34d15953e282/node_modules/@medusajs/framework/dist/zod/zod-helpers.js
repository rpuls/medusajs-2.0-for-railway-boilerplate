"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zodValidator = zodValidator;
const utils_1 = require("../utils");
const zod_1 = require("zod");
const formatPath = (issue) => {
    return issue.path.join(", ");
};
const formatInvalidType = (issues) => {
    const expected = issues
        .map((i) => {
        // Unforutnately the zod library doesn't distinguish between a wrong type and a required field, which we want to handle differently
        if (i.code === "invalid_type" && i.message !== "Required") {
            return i.expected;
        }
        return;
    })
        .filter(Boolean);
    if (!expected.length) {
        return;
    }
    const received = issues?.[0]?.received;
    return `Expected type: '${expected.join(", ")}' for field '${formatPath(issues[0])}', got: '${received}'`;
};
const formatRequiredField = (issues) => {
    const expected = issues
        .map((i) => {
        if (i.code === "invalid_type" && i.message === "Required") {
            return i.expected;
        }
        return;
    })
        .filter(Boolean);
    if (!expected.length) {
        return;
    }
    return `Field '${formatPath(issues[0])}' is required`;
};
const formatUnionError = (issue) => {
    const issues = issue.unionErrors.flatMap((e) => e.issues);
    return (formatInvalidType(issues) || formatRequiredField(issues) || issue.message);
};
const formatError = (err) => {
    const issueMessages = err.issues.slice(0, 3).map((issue) => {
        switch (issue.code) {
            case "invalid_type":
                return (formatInvalidType([issue]) ||
                    formatRequiredField([issue]) ||
                    issue.message);
            case "invalid_literal":
                return `Expected literal: '${issue.expected}' for field '${formatPath(issue)}', but got: '${issue.received}'`;
            case "invalid_union":
                return formatUnionError(issue);
            case "invalid_enum_value":
                return `Expected: '${issue.options.join(", ")}' for field '${formatPath(issue)}', but got: '${issue.received}'`;
            case "unrecognized_keys":
                return `Unrecognized fields: '${issue.keys.join(", ")}'`;
            case "invalid_arguments":
                return `Invalid arguments for '${issue.path.join(", ")}'`;
            case "too_small":
                return `Value for field '${formatPath(issue)}' too small, expected at least: '${issue.minimum}'`;
            case "too_big":
                return `Value for field '${formatPath(issue)}' too big, expected at most: '${issue.maximum}'`;
            case "not_multiple_of":
                return `Value for field '${formatPath(issue)}' not multiple of: '${issue.multipleOf}'`;
            case "not_finite":
                return `Value for field '${formatPath(issue)}' not finite: '${issue.message}'`;
            case "invalid_union_discriminator":
            case "invalid_return_type":
            case "invalid_date":
            case "invalid_string":
            case "invalid_intersection_types":
            default:
                return issue.message;
        }
    });
    return issueMessages.join("; ");
};
async function zodValidator(zodSchema, body) {
    let strictSchema = zodSchema;
    // ZodEffects doesn't support setting as strict, for all other schemas we want to enforce strictness.
    if ("strict" in zodSchema) {
        strictSchema = zodSchema.strict();
    }
    try {
        return await strictSchema.parseAsync(body);
    }
    catch (err) {
        if (err instanceof zod_1.ZodError) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Invalid request: ${formatError(err)}`);
        }
        throw err;
    }
}
//# sourceMappingURL=zod-helpers.js.map