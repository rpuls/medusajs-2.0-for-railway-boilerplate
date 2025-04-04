"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Skeleton = void 0;
const tslib_1 = require("tslib");
const React = tslib_1.__importStar(require("react"));
const clx_1 = require("../../utils/clx");
function Skeleton({ className, ...props }) {
    return (React.createElement("div", { className: (0, clx_1.clx)("bg-ui-bg-component animate-pulse rounded-md", className), ...props }));
}
exports.Skeleton = Skeleton;
//# sourceMappingURL=skeleton.js.map