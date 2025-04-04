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
const Puzzle = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("g", { clipPath: "url(#a)" },
            React.createElement("path", { stroke: color, strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M12.611 6.833c.33 0 .636.105.889.282v-2.06c0-.98-.796-1.777-1.778-1.777h-2.06a1.556 1.556 0 1 0-2.548 0H5.057c-.983 0-1.778.796-1.778 1.777v2.06a1.556 1.556 0 1 0 0 2.548v2.06c0 .98.795 1.777 1.778 1.777h2.06a1.556 1.556 0 1 1 2.548 0h2.058c.982 0 1.778-.796 1.778-1.778v-2.06a1.556 1.556 0 1 1-.889-2.83" })),
        React.createElement("defs", null,
            React.createElement("clipPath", { id: "a" },
                React.createElement("path", { fill: "#fff", d: "M0 0h15v15H0z" })))));
});
Puzzle.displayName = "Puzzle";
export default Puzzle;
