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
const ServerStackSolid = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("g", { fill: color, clipPath: "url(#a)" },
            React.createElement("path", { d: "M12.611 1.278H2.39c-1.103 0-2 .897-2 2v1.778c0 1.103.897 2 2 2H12.61c1.103 0 2-.897 2-2V3.278c0-1.103-.897-2-2-2M3.278 4.833a.667.667 0 1 1 0-1.333.667.667 0 0 1 0 1.333m2.222 0a.667.667 0 1 1 0-1.333.667.667 0 0 1 0 1.333M12.611 7.944H2.39c-1.103 0-2 .897-2 2v1.778c0 1.103.897 2 2 2H12.61c1.103 0 2-.897 2-2V9.944c0-1.103-.897-2-2-2M3.278 11.5a.667.667 0 1 1 0-1.334.667.667 0 0 1 0 1.334m2.222 0a.667.667 0 1 1 0-1.334.667.667 0 0 1 0 1.334" })),
        React.createElement("defs", null,
            React.createElement("clipPath", { id: "a" },
                React.createElement("path", { fill: "#fff", d: "M0 0h15v15H0z" })))));
});
ServerStackSolid.displayName = "ServerStackSolid";
export default ServerStackSolid;
