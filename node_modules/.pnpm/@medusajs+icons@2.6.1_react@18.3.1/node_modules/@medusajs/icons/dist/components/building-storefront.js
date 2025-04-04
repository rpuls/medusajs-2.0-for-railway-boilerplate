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
const BuildingStorefront = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("g", { stroke: color, strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, clipPath: "url(#a)" },
            React.createElement("path", { d: "M2.833 13.945v-6M12.167 7.944v6M11.65 1.056h-8.3a.89.89 0 0 0-.773.448L1.061 4.167a2.66 2.66 0 0 0 2.418 1.555 2.65 2.65 0 0 0 2.01-.932 2.65 2.65 0 0 0 2.011.932c.807 0 1.52-.365 2.01-.931a2.65 2.65 0 0 0 2.01.931c1.074 0 1.995-.639 2.417-1.555l-1.514-2.663a.89.89 0 0 0-.774-.448M5.944 13.722v-2.666a1.556 1.556 0 0 1 3.112 0v2.666M1.056 13.945h12.888" })),
        React.createElement("defs", null,
            React.createElement("clipPath", { id: "a" },
                React.createElement("path", { fill: "#fff", d: "M0 0h15v15H0z" })))));
});
BuildingStorefront.displayName = "BuildingStorefront";
export default BuildingStorefront;
