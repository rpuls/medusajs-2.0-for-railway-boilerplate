"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
const is_truthy_1 = __importDefault(require("./is-truthy"));
const MEDUSA_TELEMETRY_VERBOSE = process.env.MEDUSA_TELEMETRY_VERBOSE || false;
class Outbox {
    constructor(baseDir) {
        this.eventsJsonFileName = `events.json`;
        this.bufferFilePath = path_1.default.join(baseDir, this.eventsJsonFileName);
        this.baseDir = baseDir;
    }
    appendToBuffer(event) {
        try {
            (0, fs_1.appendFileSync)(this.bufferFilePath, event, `utf8`);
        }
        catch (e) {
            if ((0, is_truthy_1.default)(MEDUSA_TELEMETRY_VERBOSE)) {
                console.error("Failed to append to buffer", e);
            }
        }
    }
    getSize() {
        if (!(0, fs_1.existsSync)(this.bufferFilePath)) {
            return 0;
        }
        try {
            const stats = (0, fs_1.statSync)(this.bufferFilePath);
            return stats.size;
        }
        catch (e) {
            if ((0, is_truthy_1.default)(MEDUSA_TELEMETRY_VERBOSE)) {
                console.error("Failed to get outbox size", e);
            }
        }
        return 0;
    }
    getCount() {
        if (!(0, fs_1.existsSync)(this.bufferFilePath)) {
            return 0;
        }
        try {
            const fileBuffer = (0, fs_1.readFileSync)(this.bufferFilePath);
            const str = fileBuffer.toString();
            const lines = str.split("\n");
            return lines.length - 1;
        }
        catch (e) {
            if ((0, is_truthy_1.default)(MEDUSA_TELEMETRY_VERBOSE)) {
                console.error("Failed to get outbox count", e);
            }
        }
        return 0;
    }
    async flushFile(filePath, flushOperation) {
        const now = `${Date.now()}-${process.pid}`;
        let success = false;
        let contents = ``;
        try {
            if (!(0, fs_1.existsSync)(filePath)) {
                return true;
            }
            // Unique temporary file name across multiple concurrent Medusa instances
            const newPath = `${this.bufferFilePath}-${now}`;
            (0, fs_1.renameSync)(filePath, newPath);
            contents = (0, fs_1.readFileSync)(newPath, `utf8`);
            (0, fs_1.unlinkSync)(newPath);
            // There is still a chance process dies while sending data and some events are lost
            // This will be ok for now, however
            success = await flushOperation(contents);
        }
        catch (e) {
            if ((0, is_truthy_1.default)(MEDUSA_TELEMETRY_VERBOSE)) {
                console.error("Failed to perform file flush", e);
            }
        }
        finally {
            // if sending fails, we write the data back to the log
            if (!success) {
                if ((0, is_truthy_1.default)(MEDUSA_TELEMETRY_VERBOSE)) {
                    console.error("File flush did not succeed - writing back to file", success);
                }
                this.appendToBuffer(contents);
            }
        }
        return true;
    }
    async startFlushEvents(flushOperation) {
        try {
            await this.flushFile(this.bufferFilePath, flushOperation);
            const files = (0, fs_1.readdirSync)(this.baseDir);
            const filtered = files.filter(p => p.startsWith(`events.json`));
            for (const file of filtered) {
                await this.flushFile(path_1.default.join(this.baseDir, file), flushOperation);
            }
            return true;
        }
        catch (e) {
            if ((0, is_truthy_1.default)(MEDUSA_TELEMETRY_VERBOSE)) {
                console.error("Failed to perform flush", e);
            }
        }
        return false;
    }
}
exports.default = Outbox;
