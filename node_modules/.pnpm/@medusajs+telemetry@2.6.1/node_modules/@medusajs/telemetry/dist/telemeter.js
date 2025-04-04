"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const is_docker_1 = __importDefault(require("is-docker"));
const os_1 = __importDefault(require("os"));
const path_1 = require("path");
const uuid_1 = require("uuid");
const store_1 = __importDefault(require("./store"));
const create_flush_1 = __importDefault(require("./util/create-flush"));
const get_term_program_1 = __importDefault(require("./util/get-term-program"));
const is_ci_1 = require("./util/is-ci");
const is_truthy_1 = __importDefault(require("./util/is-truthy"));
const show_notification_1 = __importDefault(require("./util/show-notification"));
const MEDUSA_TELEMETRY_VERBOSE = process.env.MEDUSA_TELEMETRY_VERBOSE || false;
class Telemeter {
    constructor(options = {}) {
        this.store_ = new store_1.default();
        this.flushAt = Math.max(options.flushAt, 1) || 20;
        this.maxQueueSize = options.maxQueueSize || 1024 * 500;
        this.flushInterval = options.flushInterval || 10 * 1000;
        this.flushed = false;
        this.queueSize_ = this.store_.getQueueSize();
        this.queueCount_ = this.store_.getQueueCount();
        this.featureFlags_ = new Set();
        this.modules_ = new Set();
        this.plugins_ = [];
    }
    getMachineId() {
        if (this.machineId) {
            return this.machineId;
        }
        let machineId = this.store_.getConfig(`telemetry.machine_id`);
        if (typeof machineId !== `string`) {
            machineId = (0, uuid_1.v4)();
            this.store_.setConfig(`telemetry.machine_id`, machineId);
        }
        this.machineId = machineId;
        return machineId;
    }
    isTrackingEnabled() {
        // Cache the result
        if (this.trackingEnabled !== undefined) {
            return this.trackingEnabled;
        }
        let enabled = this.store_.getConfig(`telemetry.enabled`);
        if (enabled === undefined || enabled === null) {
            if (!(0, is_ci_1.isCI)()) {
                (0, show_notification_1.default)();
            }
            enabled = true;
            this.store_.setConfig(`telemetry.enabled`, enabled);
        }
        this.trackingEnabled = enabled;
        return enabled;
    }
    getOsInfo() {
        if (this.osInfo) {
            return this.osInfo;
        }
        const cpus = os_1.default.cpus();
        const osInfo = {
            node_version: process.version,
            platform: os_1.default.platform(),
            release: os_1.default.release(),
            cpus: (cpus && cpus.length > 0 && cpus[0].model) || undefined,
            is_ci: (0, is_ci_1.isCI)(),
            ci_name: (0, is_ci_1.getCIName)(),
            arch: os_1.default.arch(),
            docker: (0, is_docker_1.default)(),
            term_program: (0, get_term_program_1.default)(),
        };
        this.osInfo = osInfo;
        return osInfo;
    }
    getMedusaVersion() {
        try {
            const packageJson = require.resolve(`@medusajs/medusa/package.json`);
            const { version } = JSON.parse(fs_1.default.readFileSync(packageJson, `utf-8`));
            return version;
        }
        catch (e) {
            if ((0, is_truthy_1.default)(MEDUSA_TELEMETRY_VERBOSE)) {
                console.error("failed to get medusa version", e);
            }
        }
        return `-0.0.0`;
    }
    getCliVersion() {
        try {
            const jsonfile = (0, path_1.join)(require.resolve(`@medusajs/cli`).split(`${path_1.sep}dist`).shift(), "package.json");
            const { version } = require(jsonfile);
            return version;
        }
        catch (e) {
            if ((0, is_truthy_1.default)(MEDUSA_TELEMETRY_VERBOSE)) {
                console.error("failed to get medusa version", e);
            }
        }
        return `-0.0.0`;
    }
    setTelemetryEnabled(enabled) {
        this.trackingEnabled = enabled;
        this.store_.setConfig(`telemetry.enabled`, enabled);
    }
    track(event, data) {
        return this.enqueue_(event, data);
    }
    enqueue_(type, data) {
        const event = {
            id: `te_${(0, uuid_1.v4)()}`,
            type,
            properties: data,
            timestamp: new Date(),
            machine_id: this.getMachineId(),
            os_info: this.getOsInfo(),
            medusa_version: this.getMedusaVersion(),
            cli_version: this.getCliVersion(),
            feature_flags: Array.from(this.featureFlags_),
            modules: Array.from(this.modules_),
            plugins: this.plugins_,
        };
        this.store_.addEvent(event);
        this.queueCount_ += 1;
        this.queueSize_ += JSON.stringify(event).length;
        const hasReachedFlushAt = this.queueCount_ >= this.flushAt;
        const hasReachedQueueSize = this.queueSize_ >= this.maxQueueSize;
        if (hasReachedQueueSize || hasReachedFlushAt) {
            const flush = (0, create_flush_1.default)(this.isTrackingEnabled());
            flush && flush();
        }
        if (this.flushInterval && !this.timer) {
            const flush = (0, create_flush_1.default)(this.isTrackingEnabled());
            if (flush) {
                this.timer = setTimeout(flush, this.flushInterval);
            }
        }
    }
    trackFeatureFlag(flag) {
        if (flag) {
            this.featureFlags_.add(flag);
        }
    }
    trackModule(module) {
        if (module) {
            this.modules_.add(module);
        }
    }
    trackPlugin(plugin) {
        if (plugin) {
            this.plugins_.push(plugin);
        }
    }
}
exports.default = Telemeter;
