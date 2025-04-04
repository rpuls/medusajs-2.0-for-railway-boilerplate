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
const FolderIllustration = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("path", { fill: "#60A5FA", fillRule: "evenodd", d: "M13.935 11.183a2.32 2.32 0 0 1-2.318 2.319H3.383a2.32 2.32 0 0 1-2.318-2.319V3.817a2.32 2.32 0 0 1 2.318-2.319h1.691c.704 0 1.368.32 1.808.867l.348.433h4.387a2.32 2.32 0 0 1 2.318 2.319z", clipRule: "evenodd" }),
        React.createElement("path", { fill: "url(#a)", fillOpacity: 0.15, fillRule: "evenodd", d: "M13.935 11.183a2.32 2.32 0 0 1-2.318 2.319H3.383a2.32 2.32 0 0 1-2.318-2.319V3.817a2.32 2.32 0 0 1 2.318-2.319h1.691c.704 0 1.368.32 1.808.867l.348.433h4.387a2.32 2.32 0 0 1 2.318 2.319z", clipRule: "evenodd" }),
        React.createElement("path", { stroke: "#000", strokeLinecap: "round", strokeLinejoin: "round", strokeOpacity: 0.15, strokeWidth: 0.5, d: "M7.034 2.955a.25.25 0 0 0 .196.093h4.387c1.142 0 2.068.926 2.068 2.069v6.066a2.07 2.07 0 0 1-2.068 2.069H3.383a2.07 2.07 0 0 1-2.068-2.069V3.817c0-1.143.926-2.069 2.068-2.069h1.691c.628 0 1.22.285 1.613.774z" }),
        React.createElement("g", { filter: "url(#b)" },
            React.createElement("path", { fill: "#60A5FA", d: "M1.065 7.283a2.32 2.32 0 0 1 2.318-2.318h8.234a2.32 2.32 0 0 1 2.318 2.318v3.9a2.32 2.32 0 0 1-2.318 2.318H3.383a2.32 2.32 0 0 1-2.318-2.318z" }),
            React.createElement("path", { fill: "url(#c)", fillOpacity: 0.2, d: "M1.065 7.283a2.32 2.32 0 0 1 2.318-2.318h8.234a2.32 2.32 0 0 1 2.318 2.318v3.9a2.32 2.32 0 0 1-2.318 2.318H3.383a2.32 2.32 0 0 1-2.318-2.318z" })),
        React.createElement("defs", null,
            React.createElement("linearGradient", { id: "a", x1: 7.5, x2: 7.5, y1: 1.498, y2: 13.502, gradientUnits: "userSpaceOnUse" },
                React.createElement("stop", null),
                React.createElement("stop", { offset: 1, stopOpacity: 0 })),
            React.createElement("linearGradient", { id: "c", x1: 7.5, x2: 7.5, y1: 4.965, y2: 13.501, gradientUnits: "userSpaceOnUse" },
                React.createElement("stop", { stopColor: "#fff" }),
                React.createElement("stop", { offset: 1, stopColor: "#fff", stopOpacity: 0 })),
            React.createElement("filter", { id: "b", width: 12.87, height: 8.537, x: 1.065, y: 4.965, colorInterpolationFilters: "sRGB", filterUnits: "userSpaceOnUse" },
                React.createElement("feFlood", { floodOpacity: 0, result: "BackgroundImageFix" }),
                React.createElement("feBlend", { in: "SourceGraphic", in2: "BackgroundImageFix", result: "shape" }),
                React.createElement("feColorMatrix", { in: "SourceAlpha", result: "hardAlpha", values: "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" }),
                React.createElement("feOffset", { dy: -0.5 }),
                React.createElement("feComposite", { in2: "hardAlpha", k2: -1, k3: 1, operator: "arithmetic" }),
                React.createElement("feColorMatrix", { values: "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0" }),
                React.createElement("feBlend", { in2: "shape", result: "effect1_innerShadow_6347_11987" }),
                React.createElement("feColorMatrix", { in: "SourceAlpha", result: "hardAlpha", values: "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" }),
                React.createElement("feOffset", { dy: 0.5 }),
                React.createElement("feComposite", { in2: "hardAlpha", k2: -1, k3: 1, operator: "arithmetic" }),
                React.createElement("feColorMatrix", { values: "0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.2 0" }),
                React.createElement("feBlend", { in2: "effect1_innerShadow_6347_11987", result: "effect2_innerShadow_6347_11987" })))));
});
FolderIllustration.displayName = "FolderIllustration";
export default FolderIllustration;
