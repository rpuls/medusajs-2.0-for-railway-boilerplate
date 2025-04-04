"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlagRouter = void 0;
const common_1 = require("../../common");
class FlagRouter {
    constructor(flags) {
        this.flags = {};
        this.flags = flags;
    }
    /**
     * Check if a feature flag is enabled.
     * There are two ways of using this method:
     * 1. `isFeatureEnabled("myFeatureFlag")`
     * 2. `isFeatureEnabled({ myNestedFeatureFlag: "someNestedFlag" })`
     * We use 1. for top-level feature flags and 2. for nested feature flags. Almost all flags are top-level.
     * An example of a nested flag is workflows. To use it, you would do:
     * `isFeatureEnabled({ workflows: Workflows.CreateCart })`
     * @param flag - The flag to check
     * @return {boolean} - Whether the flag is enabled or not
     */
    isFeatureEnabled(flag) {
        if ((0, common_1.isObject)(flag)) {
            const [nestedFlag, value] = Object.entries(flag)[0];
            if (typeof this.flags[nestedFlag] === "boolean") {
                return this.flags[nestedFlag];
            }
            return !!this.flags[nestedFlag]?.[value];
        }
        const flags = (Array.isArray(flag) ? flag : [flag]);
        return flags.every((flag_) => {
            if (!(0, common_1.isString)(flag_)) {
                throw Error("Flag must be a string an array of string or an object");
            }
            return !!this.flags[flag_];
        });
    }
    /**
     * Sets a feature flag.
     * Flags take two shapes:
     * `setFlag("myFeatureFlag", true)`
     * `setFlag("myFeatureFlag", { nestedFlag: true })`
     * These shapes are used for top-level and nested flags respectively, as explained in isFeatureEnabled.
     * @param key - The key of the flag to set.
     * @param value - The value of the flag to set.
     * @return {void} - void
     */
    setFlag(key, value) {
        if ((0, common_1.isObject)(value)) {
            const existing = this.flags[key];
            if (!existing) {
                this.flags[key] = value;
                return;
            }
            this.flags[key] = { ...this.flags[key], ...value };
            return;
        }
        this.flags[key] = value;
    }
    listFlags() {
        return Object.entries(this.flags || {}).map(([key, value]) => ({
            key,
            value,
        }));
    }
}
exports.FlagRouter = FlagRouter;
//# sourceMappingURL=flag-router.js.map