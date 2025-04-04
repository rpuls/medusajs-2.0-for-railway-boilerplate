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
const Server = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("g", { stroke: color, strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, clipPath: "url(#a)" },
            React.createElement("path", { d: "M12.611 8.167H2.39c-.736 0-1.333.597-1.333 1.333v1.778c0 .736.597 1.333 1.333 1.333H12.61c.736 0 1.333-.597 1.333-1.333V9.5c0-.736-.597-1.333-1.333-1.333" }),
            React.createElement("path", { d: "m1.136 9.046 1.96-5.886a1.78 1.78 0 0 1 1.687-1.216h5.436c.766 0 1.446.49 1.687 1.216l1.96 5.886M3.278 10.389h2.444" })),
        React.createElement("defs", null,
            React.createElement("clipPath", { id: "a" },
                React.createElement("path", { fill: "#fff", d: "M0 0h15v15H0z" })))));
});
Server.displayName = "Server";
export default Server;
