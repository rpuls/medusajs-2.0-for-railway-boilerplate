var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import * as React from "react";
const ThumbnailBadge = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 20, height: 20, fill: "none", ref: ref }, props),
        React.createElement("g", { filter: "url(#a)" },
            React.createElement("circle", { cx: 10, cy: 8.903, r: 7.806, fill: "#3B82F6" }),
            React.createElement("circle", { cx: 10, cy: 8.903, r: 7.806, fill: "url(#b)", fillOpacity: 0.2 }),
            React.createElement("circle", { cx: 10, cy: 8.903, r: 7.556, stroke: "#000", strokeOpacity: 0.2, strokeWidth: 0.5 })),
        React.createElement("g", { fill: "#fff", clipPath: "url(#c)" },
            React.createElement("path", { d: "M6.098 11.393a.724.724 0 0 1-.724-.723V7.136a.724.724 0 0 1 .951-.686l.487.163a.434.434 0 1 1-.274.822l-.297-.098v3.133l.297-.099a.433.433 0 1 1 .274.823l-.487.162a.7.7 0 0 1-.227.037M8.41 12.517a.723.723 0 0 1-.722-.723V6.012a.72.72 0 0 1 1-.667l.467.194a.434.434 0 0 1-.333.801l-.267-.111v5.349l.267-.111a.434.434 0 1 1 .333.8l-.467.195a.7.7 0 0 1-.278.055M14.038 5.752l-3.012-1.39A.722.722 0 0 0 10 5.018v7.77a.72.72 0 0 0 .722.724.7.7 0 0 0 .304-.067l3.012-1.39c.357-.165.588-.526.588-.92V6.672c0-.393-.23-.754-.588-.919" })),
        React.createElement("defs", null,
            React.createElement("linearGradient", { id: "b", x1: 10.09, x2: 10.09, y1: 1.142, y2: 16.754, gradientUnits: "userSpaceOnUse" },
                React.createElement("stop", { stopColor: "#fff" }),
                React.createElement("stop", { offset: 1, stopColor: "#fff", stopOpacity: 0 })),
            React.createElement("clipPath", { id: "c" },
                React.createElement("path", { fill: "#fff", d: "M4.796 3.699h10.408v10.408H4.796z" })),
            React.createElement("filter", { id: "a", width: 20, height: 20, x: 0, y: 0, colorInterpolationFilters: "sRGB", filterUnits: "userSpaceOnUse" },
                React.createElement("feFlood", { floodOpacity: 0, result: "BackgroundImageFix" }),
                React.createElement("feColorMatrix", { in: "SourceAlpha", result: "hardAlpha", values: "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" }),
                React.createElement("feOffset", { dy: 1.054 }),
                React.createElement("feGaussianBlur", { stdDeviation: 1.054 }),
                React.createElement("feComposite", { in2: "hardAlpha", operator: "out" }),
                React.createElement("feColorMatrix", { values: "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0" }),
                React.createElement("feBlend", { in2: "BackgroundImageFix", result: "effect1_dropShadow_6384_214" }),
                React.createElement("feBlend", { in: "SourceGraphic", in2: "effect1_dropShadow_6384_214", result: "shape" }),
                React.createElement("feColorMatrix", { in: "SourceAlpha", result: "hardAlpha", values: "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" }),
                React.createElement("feOffset", { dy: 1.054 }),
                React.createElement("feGaussianBlur", { stdDeviation: 1.054 }),
                React.createElement("feComposite", { in2: "hardAlpha", k2: -1, k3: 1, operator: "arithmetic" }),
                React.createElement("feColorMatrix", { values: "0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.1 0" }),
                React.createElement("feBlend", { in2: "shape", result: "effect2_innerShadow_6384_214" }),
                React.createElement("feColorMatrix", { in: "SourceAlpha", result: "hardAlpha", values: "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" }),
                React.createElement("feOffset", { dy: -1.054 }),
                React.createElement("feGaussianBlur", { stdDeviation: 2.635 }),
                React.createElement("feComposite", { in2: "hardAlpha", k2: -1, k3: 1, operator: "arithmetic" }),
                React.createElement("feColorMatrix", { values: "0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.1 0" }),
                React.createElement("feBlend", { in2: "effect2_innerShadow_6384_214", result: "effect3_innerShadow_6384_214" })))));
});
ThumbnailBadge.displayName = "ThumbnailBadge";
export default ThumbnailBadge;
