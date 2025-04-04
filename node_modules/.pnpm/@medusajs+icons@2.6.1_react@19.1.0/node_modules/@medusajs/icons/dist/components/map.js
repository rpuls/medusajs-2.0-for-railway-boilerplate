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
const Map = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("g", { stroke: color, strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, clipPath: "url(#a)" },
            React.createElement("path", { d: "M5.056 1.982v9.333M9.944 3.685v9.333M1.752 2.679 4.802 2a.9.9 0 0 1 .497.032l4.402 1.601c.159.058.331.07.497.032l2.665-.592a.888.888 0 0 1 1.081.868v7.513c0 .417-.29.778-.696.867l-3.05.679a.9.9 0 0 1-.497-.032l-4.402-1.601a.9.9 0 0 0-.497-.032l-2.665.592a.89.89 0 0 1-1.081-.868V3.546c0-.417.29-.778.696-.867" })),
        React.createElement("defs", null,
            React.createElement("clipPath", { id: "a" },
                React.createElement("path", { fill: "#fff", d: "M0 0h15v15H0z" })))));
});
Map.displayName = "Map";
export default Map;
