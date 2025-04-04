"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simpleHash = simpleHash;
// DJB2 hash function
function simpleHash(text) {
    let hash = 5381;
    for (let i = 0; i < text.length; i++) {
        hash = (hash << 5) + hash + text.charCodeAt(i);
    }
    return hash.toString(16);
}
//# sourceMappingURL=simple-hash.js.map