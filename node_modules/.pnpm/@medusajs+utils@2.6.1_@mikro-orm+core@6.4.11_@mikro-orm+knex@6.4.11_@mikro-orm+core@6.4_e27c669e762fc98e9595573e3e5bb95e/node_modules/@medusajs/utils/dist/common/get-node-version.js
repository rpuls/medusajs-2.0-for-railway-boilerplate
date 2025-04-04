"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MIN_SUPPORTED_NODE_VERSION = void 0;
exports.getNodeVersion = getNodeVersion;
function getNodeVersion() {
    const [major] = process.versions.node.split(".").map(Number);
    return major;
}
exports.MIN_SUPPORTED_NODE_VERSION = 20;
//# sourceMappingURL=get-node-version.js.map