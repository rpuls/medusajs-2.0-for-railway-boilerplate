// src/config/utils.ts
import { z } from "zod";
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
export {
  defineRouteConfig,
  defineWidgetConfig
};
