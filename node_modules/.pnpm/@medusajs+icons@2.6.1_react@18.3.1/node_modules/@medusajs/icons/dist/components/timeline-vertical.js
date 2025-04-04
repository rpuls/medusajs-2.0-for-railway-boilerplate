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
const TimelineVertical = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("g", { stroke: color, strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, clipPath: "url(#a)" },
            React.createElement("path", { d: "M2.389 1.056v4.888M2.389 13.944V9.056M13.056 1.5H7.278a.89.89 0 0 0-.89.889v2.667c0 .49.399.888.89.888h5.778c.49 0 .888-.398.888-.888V2.389a.89.89 0 0 0-.889-.889M2.389 9.055a1.556 1.556 0 1 0 0-3.11 1.556 1.556 0 0 0 0 3.11M13.056 9.056H7.278a.89.89 0 0 0-.89.888v2.667c0 .491.399.889.89.889h5.778c.49 0 .888-.398.888-.889V9.944a.89.89 0 0 0-.889-.888" })),
        React.createElement("defs", null,
            React.createElement("clipPath", { id: "a" },
                React.createElement("path", { fill: "#fff", d: "M0 0h15v15H0z" })))));
});
TimelineVertical.displayName = "TimelineVertical";
export default TimelineVertical;
