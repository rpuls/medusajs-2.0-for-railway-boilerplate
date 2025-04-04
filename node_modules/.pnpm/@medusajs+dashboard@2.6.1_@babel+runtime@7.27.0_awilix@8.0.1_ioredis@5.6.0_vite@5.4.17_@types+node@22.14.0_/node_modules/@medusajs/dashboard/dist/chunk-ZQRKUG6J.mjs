import {
  castNumber
} from "./chunk-6GU6IDUA.mjs";

// src/lib/validation.ts
import i18next from "i18next";
import { z } from "zod";
var optionalInt = z.union([z.string(), z.number()]).optional().refine(
  (value) => {
    if (value === "" || value === void 0) {
      return true;
    }
    return Number.isInteger(castNumber(value));
  },
  {
    message: i18next.t("validation.mustBeInt")
  }
).refine(
  (value) => {
    if (value === "" || value === void 0) {
      return true;
    }
    return castNumber(value) >= 0;
  },
  {
    message: i18next.t("validation.mustBePositive")
  }
);
var optionalFloat = z.union([z.string(), z.number()]).optional().refine(
  (value) => {
    if (value === "" || value === void 0) {
      return true;
    }
    return castNumber(value) >= 0;
  },
  {
    message: i18next.t("validation.mustBePositive")
  }
);
var metadataFormSchema = z.array(
  z.object({
    key: z.string(),
    value: z.unknown(),
    isInitial: z.boolean().optional(),
    isDeleted: z.boolean().optional(),
    isIgnored: z.boolean().optional()
  })
);
function partialFormValidation(form, fields, schema) {
  form.clearErrors(fields);
  const values = fields.reduce((acc, key) => {
    acc[key] = form.getValues(key);
    return acc;
  }, {});
  const validationResult = schema.safeParse(values);
  if (!validationResult.success) {
    validationResult.error.errors.forEach(({ path, message, code }) => {
      form.setError(path.join("."), {
        type: code,
        message
      });
    });
    return false;
  }
  return true;
}

export {
  optionalInt,
  optionalFloat,
  partialFormValidation
};
