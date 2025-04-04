"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Telemeter = exports.Store = exports.setTelemetryEnabled = exports.track = exports.flush = void 0;
exports.trackFeatureFlag = trackFeatureFlag;
exports.trackInstallation = trackInstallation;
const telemeter_1 = __importDefault(require("./telemeter"));
const create_flush_1 = __importDefault(require("./util/create-flush"));
const telemeter = new telemeter_1.default();
exports.flush = (0, create_flush_1.default)(telemeter.isTrackingEnabled());
if (exports.flush) {
    process.on(`exit`, exports.flush);
}
const track = (event, data = {}) => {
    telemeter.track(event, data);
};
exports.track = track;
const setTelemetryEnabled = (enabled = true) => {
    telemeter.setTelemetryEnabled(enabled);
};
exports.setTelemetryEnabled = setTelemetryEnabled;
function trackFeatureFlag(flag) {
    telemeter.trackFeatureFlag(flag);
}
function trackInstallation(installation, type) {
    switch (type) {
        case `plugin`:
            telemeter.trackPlugin(installation);
            break;
        case `module`:
            telemeter.trackModule(installation);
            break;
    }
}
var store_1 = require("./store");
Object.defineProperty(exports, "Store", { enumerable: true, get: function () { return __importDefault(store_1).default; } });
var telemeter_2 = require("./telemeter");
Object.defineProperty(exports, "Telemeter", { enumerable: true, get: function () { return __importDefault(telemeter_2).default; } });
