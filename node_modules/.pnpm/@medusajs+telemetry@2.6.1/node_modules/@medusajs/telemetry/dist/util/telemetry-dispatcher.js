"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const remove_trailing_slash_1 = __importDefault(require("remove-trailing-slash"));
const axios_1 = __importDefault(require("axios"));
const axios_retry_1 = __importDefault(require("axios-retry"));
const show_notification_1 = __importDefault(require("./show-notification"));
const store_1 = __importDefault(require("../store"));
const is_truthy_1 = __importDefault(require("./is-truthy"));
const MEDUSA_TELEMETRY_VERBOSE = process.env.MEDUSA_TELEMETRY_VERBOSE || false;
class TelemetryDispatcher {
    constructor(options) {
        this.store_ = new store_1.default();
        this.host = (0, remove_trailing_slash_1.default)(options.host || "https://telemetry.medusa-commerce.com");
        this.path = (0, remove_trailing_slash_1.default)(options.path || "/batch");
        let axiosInstance = options.axiosInstance;
        if (!axiosInstance) {
            axiosInstance = axios_1.default.create();
        }
        this.axiosInstance = axiosInstance;
        this.timeout = options.timeout || false;
        this.flushed = false;
        (0, axios_retry_1.default)(this.axiosInstance, {
            retries: 3,
            retryDelay: axios_retry_1.default.exponentialDelay,
            retryCondition: this.isErrorRetryable_,
        });
    }
    isTrackingEnabled() {
        // Cache the result
        if (this.trackingEnabled !== undefined) {
            return this.trackingEnabled;
        }
        let enabled = this.store_.getConfig(`telemetry.enabled`);
        if (enabled === undefined || enabled === null) {
            (0, show_notification_1.default)();
            enabled = true;
            this.store_.setConfig(`telemetry.enabled`, enabled);
        }
        this.trackingEnabled = enabled;
        return enabled;
    }
    async dispatch() {
        if (!this.isTrackingEnabled()) {
            return;
        }
        await this.store_.flushEvents(async (events) => {
            if (!events.length) {
                if ((0, is_truthy_1.default)(MEDUSA_TELEMETRY_VERBOSE)) {
                    console.log("No events to POST - skipping");
                }
                return true;
            }
            const data = {
                batch: events,
                timestamp: new Date(),
            };
            const req = {
                headers: {},
            };
            return await this.axiosInstance
                .post(`${this.host}${this.path}`, data, req)
                .then(() => {
                if ((0, is_truthy_1.default)(MEDUSA_TELEMETRY_VERBOSE)) {
                    console.log("POSTing batch succeeded");
                }
                return true;
            })
                .catch(e => {
                if ((0, is_truthy_1.default)(MEDUSA_TELEMETRY_VERBOSE)) {
                    console.error("Failed to POST event batch", e);
                }
                return false;
            });
        });
    }
    isErrorRetryable_(error) {
        // Retry Network Errors.
        if (axios_retry_1.default.isNetworkError(error)) {
            return true;
        }
        if (!error.response) {
            // Cannot determine if the request can be retried
            return false;
        }
        // Retry Server Errors (5xx).
        if (error.response.status >= 500 && error.response.status <= 599) {
            return true;
        }
        // Retry if rate limited.
        if (error.response.status === 429) {
            return true;
        }
        return false;
    }
}
exports.default = TelemetryDispatcher;
