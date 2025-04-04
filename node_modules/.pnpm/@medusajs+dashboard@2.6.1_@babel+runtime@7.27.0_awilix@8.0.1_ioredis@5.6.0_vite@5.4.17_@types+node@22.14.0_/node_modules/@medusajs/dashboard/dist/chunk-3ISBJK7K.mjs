import {
  castNumber
} from "./chunk-6GU6IDUA.mjs";

// src/lib/form-helpers.ts
function transformNullableFormValue(value, nullify = true) {
  if (typeof value === "string" && value.trim() === "") {
    return nullify ? null : void 0;
  }
  if (Array.isArray(value) && value.length === 0) {
    return nullify ? null : void 0;
  }
  return value;
}
function transformNullableFormData(data, nullify = true) {
  return Object.entries(data).reduce((acc, [key, value]) => {
    return {
      ...acc,
      [key]: transformNullableFormValue(value, nullify)
    };
  }, {});
}
function transformNullableFormNumber(value, nullify = true) {
  if (typeof value === "undefined" || typeof value === "string" && value.trim() === "") {
    return nullify ? null : void 0;
  }
  if (typeof value === "string") {
    return castNumber(value);
  }
  return value;
}
function transformNullableFormNumbers(data, nullify = true) {
  return Object.entries(data).reduce((acc, [key, value]) => {
    return {
      ...acc,
      [key]: transformNullableFormNumber(value, nullify)
    };
  }, {});
}

export {
  transformNullableFormData,
  transformNullableFormNumber,
  transformNullableFormNumbers
};
