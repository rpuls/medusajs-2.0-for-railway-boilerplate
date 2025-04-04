"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContainerLike = createContainerLike;
function createContainerLike(obj) {
    return {
        resolve(key) {
            return obj[key];
        },
    };
}
//# sourceMappingURL=create-container-like.js.map