"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const telemetry_dispatcher_1 = __importDefault(require("./telemetry-dispatcher"));
const MEDUSA_TELEMETRY_HOST = process.env.MEDUSA_TELEMETRY_HOST || "";
const MEDUSA_TELEMETRY_PATH = process.env.MEDUSA_TELEMETRY_PATH || "";
const dispatcher = new telemetry_dispatcher_1.default({
    host: MEDUSA_TELEMETRY_HOST,
    path: MEDUSA_TELEMETRY_PATH,
});
dispatcher.dispatch();
