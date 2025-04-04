"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const child_process_1 = require("child_process");
const is_truthy_1 = __importDefault(require("./is-truthy"));
const MEDUSA_TELEMETRY_VERBOSE = process.env.MEDUSA_TELEMETRY_VERBOSE || false;
function createFlush(enabled) {
    if (!enabled) {
        return;
    }
    return async function flush() {
        if ((0, is_truthy_1.default)(MEDUSA_TELEMETRY_VERBOSE)) {
            console.log("Flushing queue...");
        }
        const forked = (0, child_process_1.fork)((0, path_1.join)(__dirname, `send.js`), {
            detached: true,
            stdio: MEDUSA_TELEMETRY_VERBOSE ? `inherit` : `ignore`,
            execArgv: [],
        });
        forked.unref();
    };
}
exports.default = createFlush;
