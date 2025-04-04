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
const AdjustmentsDone = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("g", { clipPath: "url(#a)" },
            React.createElement("path", { fill: color, d: "M8.5 2.528h-.778a.75.75 0 1 0 0 1.5h1.08a4 4 0 0 1-.302-1.5M10.695 6.07a4 4 0 0 1-1.21-.94.75.75 0 0 0-.29.592V6.75H1.5a.75.75 0 0 0 0 1.5h7.694v1.028a.75.75 0 0 0 1.5 0zM5.806 1.5a.75.75 0 1 0-1.5 0v1.028H1.5a.75.75 0 0 0 0 1.5h2.806v1.028a.75.75 0 0 0 1.5 0V1.5M12.611 6.75a.75.75 0 0 0 0 1.5h.889a.75.75 0 0 0 0-1.5zM6.972 11.722a.75.75 0 0 1 .75-.75H13.5a.75.75 0 1 1 0 1.5H7.722a.75.75 0 0 1-.75-.75M1.5 10.972a.75.75 0 0 0 0 1.5h2.806V13.5a.75.75 0 0 0 1.5 0V9.944a.75.75 0 1 0-1.5 0v1.028z" }),
            React.createElement("circle", { cx: 12.5, cy: 2.5, r: 2.5, fill: "#60A5FA" }),
            React.createElement("circle", { cx: 12.5, cy: 2.5, r: 2, stroke: color, strokeOpacity: 0.12 })),
        React.createElement("defs", null,
            React.createElement("clipPath", { id: "a" },
                React.createElement("path", { fill: "#fff", d: "M0 0h15v15H0z" })))));
});
AdjustmentsDone.displayName = "AdjustmentsDone";
export default AdjustmentsDone;
