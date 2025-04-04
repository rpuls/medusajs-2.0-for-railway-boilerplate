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
const ServerSolid = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("g", { fill: color, clipPath: "url(#a)" },
            React.createElement("path", { d: "m14.497 8.835-1.96-5.885a2.44 2.44 0 0 0-2.319-1.672H4.782a2.44 2.44 0 0 0-2.32 1.672L.505 8.835s-.115.39-.115.665v1.778c0 1.103.897 2 2 2H12.61c1.103 0 2-.897 2-2V9.5c0-.342-.115-.665-.115-.665m-1.22 2.443a.667.667 0 0 1-.666.666H2.39a.667.667 0 0 1-.667-.666V9.5c0-.368.299-.667.667-.667H12.61c.368 0 .667.299.667.667z" }),
            React.createElement("path", { d: "M5.722 9.722H3.278a.667.667 0 0 0 0 1.334h2.444a.667.667 0 0 0 0-1.334" })),
        React.createElement("defs", null,
            React.createElement("clipPath", { id: "a" },
                React.createElement("path", { fill: "#fff", d: "M0 0h15v15H0z" })))));
});
ServerSolid.displayName = "ServerSolid";
export default ServerSolid;
