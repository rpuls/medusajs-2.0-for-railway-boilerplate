"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toUnixSlash = toUnixSlash;
function toUnixSlash(path) {
    const isExtendedLengthPath = path.startsWith("\\\\?\\");
    if (isExtendedLengthPath) {
        return path;
    }
    return path.replace(/\\/g, "/");
}
//# sourceMappingURL=to-unix-slash.js.map