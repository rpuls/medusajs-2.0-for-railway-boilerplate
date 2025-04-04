"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const boxen_1 = __importDefault(require("boxen"));
const defaultConfig = {
    padding: 1,
    borderColor: `blue`,
    borderStyle: `double`,
};
const defaultMessage = `Medusa collects anonymous usage analytics\n` +
    `to help improve Medusa for all users.\n` +
    `\n` +
    `If you'd like to opt-out, you can use \`medusa telemetry --disable\`\n`;
/**
 * Analytics notice for the end-user
 */
function showAnalyticsNotification(config = defaultConfig, message = defaultMessage) {
    console.log((0, boxen_1.default)(message, config));
}
exports.default = showAnalyticsNotification;
