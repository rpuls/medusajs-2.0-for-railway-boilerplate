"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const configstore_1 = __importDefault(require("configstore"));
const path_1 = __importDefault(require("path"));
const in_memory_config_1 = require("./util/in-memory-config");
const is_truthy_1 = __importDefault(require("./util/is-truthy"));
const outbox_store_1 = __importDefault(require("./util/outbox-store"));
class Store {
    constructor() {
        try {
            this.config_ = new configstore_1.default(`medusa`, {}, { globalConfigPath: true });
        }
        catch (e) {
            this.config_ = new in_memory_config_1.InMemoryConfigStore();
        }
        const baseDir = path_1.default.dirname(this.config_.path);
        this.outbox_ = new outbox_store_1.default(baseDir);
        this.disabled_ = (0, is_truthy_1.default)(process.env.MEDUSA_DISABLE_TELEMETRY);
    }
    getQueueSize() {
        return this.outbox_.getSize();
    }
    getQueueCount() {
        return this.outbox_.getCount();
    }
    addEvent(event) {
        if (this.disabled_) {
            return;
        }
        const eventString = JSON.stringify(event);
        return this.outbox_.appendToBuffer(eventString + `\n`);
    }
    async flushEvents(handler) {
        return await this.outbox_.startFlushEvents(async (eventData) => {
            const events = eventData
                .split(`\n`)
                .filter((e) => e && e.length > 2)
                .map((e) => JSON.parse(e));
            return await handler(events);
        });
    }
    getConfig(path) {
        return this.config_.get(path);
    }
    setConfig(path, val) {
        return this.config_.set(path, val);
    }
}
exports.default = Store;
