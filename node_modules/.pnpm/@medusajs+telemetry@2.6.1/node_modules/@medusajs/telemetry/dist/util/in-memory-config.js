"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryConfigStore = void 0;
const uuid_1 = require("uuid");
const os_1 = __importDefault(require("os"));
const path_1 = require("path");
class InMemoryConfigStore {
    constructor() {
        this.config = {};
        this.path = (0, path_1.join)(os_1.default.tmpdir(), `medusa`);
        this.config = this.createBaseConfig();
    }
    createBaseConfig() {
        return {
            "telemetry.enabled": true,
            "telemetry.machine_id": `not-a-machine-id-${(0, uuid_1.v4)()}`,
        };
    }
    get(key) {
        return this.config[key];
    }
    set(key, value) {
        this.config[key] = value;
    }
    all() {
        return this.config;
    }
    size() {
        return Object.keys(this.config).length;
    }
    has(key) {
        return !!this.config[key];
    }
    del(key) {
        delete this.config[key];
    }
    clear() {
        this.config = this.createBaseConfig();
    }
}
exports.InMemoryConfigStore = InMemoryConfigStore;
