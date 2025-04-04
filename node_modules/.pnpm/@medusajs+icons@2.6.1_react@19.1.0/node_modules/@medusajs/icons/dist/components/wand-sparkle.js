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
const WandSparkle = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("g", { clipPath: "url(#a)" },
            React.createElement("path", { stroke: color, strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "m10.786 2.214-8.582 8.582a.89.89 0 0 0 0 1.257l.743.742a.89.89 0 0 0 1.257 0l8.582-8.58a.89.89 0 0 0 0-1.258l-.743-.743a.89.89 0 0 0-1.257 0M8.733 4.267l2 2" }),
            React.createElement("path", { fill: color, d: "m5.938 2.604-.84-.28-.282-.842c-.09-.272-.54-.272-.632 0l-.28.842-.841.28a.334.334 0 0 0 0 .633l.84.28.281.842a.333.333 0 0 0 .632 0l.28-.842.841-.28a.334.334 0 0 0 .001-.633M14.307 10.158l-1.123-.374-.374-1.123c-.122-.363-.722-.363-.843 0l-.375 1.123-1.122.374a.444.444 0 0 0 0 .843l1.122.374.375 1.122a.446.446 0 0 0 .844 0l.374-1.122L14.308 11a.445.445 0 0 0 0-.843M7.722 1.722a.667.667 0 1 0 0-1.333.667.667 0 0 0 0 1.333" })),
        React.createElement("defs", null,
            React.createElement("clipPath", { id: "a" },
                React.createElement("path", { fill: "#fff", d: "M0 0h15v15H0z" })))));
});
WandSparkle.displayName = "WandSparkle";
export default WandSparkle;
