"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  defineRouteConfig: () => defineRouteConfig,
  defineWidgetConfig: () => defineWidgetConfig
});
module.exports = __toCommonJS(src_exports);

// src/config/utils.ts
var import_zod = require("zod");
function createConfigHelper(config) {
  return {
    ...config,
    /**
     * This property is required to allow the config to be exported,
     * while still allowing HMR to work correctly.
     *
     * It tricks Fast Refresh into thinking that the config is a React component,
     * which allows it to be updated without a full page reload.
     */
    $$typeof: Symbol.for("react.memo")
  };
}
function defineWidgetConfig(config) {
  return createConfigHelper(config);
}
function defineRouteConfig(config) {
  return createConfigHelper(config);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  defineRouteConfig,
  defineWidgetConfig
});
