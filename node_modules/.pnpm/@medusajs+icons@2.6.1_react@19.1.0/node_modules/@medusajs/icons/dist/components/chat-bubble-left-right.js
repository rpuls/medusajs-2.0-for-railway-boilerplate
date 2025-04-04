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
const ChatBubbleLeftRight = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("g", { stroke: color, strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, clipPath: "url(#a)" },
            React.createElement("path", { d: "M7.722 5.056h4.89c.735 0 1.332.597 1.332 1.333v4c0 .736-.597 1.333-1.333 1.333h-.444v2.223l-2.445-2.223h-2A1.334 1.334 0 0 1 6.39 10.39v-4c0-.736.597-1.333 1.333-1.333" }),
            React.createElement("path", { d: "M10.11 2.833A1.78 1.78 0 0 0 8.39 1.5H2.833c-.982 0-1.777.796-1.777 1.778v4.445c0 .981.796 1.778 1.777 1.777v2.667l1.334-1.455" })),
        React.createElement("defs", null,
            React.createElement("clipPath", { id: "a" },
                React.createElement("path", { fill: "#fff", d: "M0 0h15v15H0z" })))));
});
ChatBubbleLeftRight.displayName = "ChatBubbleLeftRight";
export default ChatBubbleLeftRight;
