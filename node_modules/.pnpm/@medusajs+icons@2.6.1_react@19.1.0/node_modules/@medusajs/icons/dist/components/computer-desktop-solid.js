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
const ComputerDesktopSolid = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("g", { fill: color, clipPath: "url(#a)" },
            React.createElement("path", { d: "M10.59 13.309a10.3 10.3 0 0 0-2.423-.448v-1.583a.667.667 0 0 0-1.334 0v1.583c-.82.053-1.634.2-2.423.448a.666.666 0 1 0 .401 1.272 9 9 0 0 1 5.377 0q.1.03.2.031a.667.667 0 0 0 .2-1.302z" }),
            React.createElement("path", { d: "M12.167 11.945H2.833A2.446 2.446 0 0 1 .39 9.5V3.722a2.446 2.446 0 0 1 2.444-2.444h9.334a2.446 2.446 0 0 1 2.444 2.444V9.5a2.446 2.446 0 0 1-2.444 2.444M2.833 2.61c-.612 0-1.11.499-1.11 1.111V9.5c0 .613.498 1.111 1.11 1.111h9.334c.612 0 1.11-.498 1.11-1.111V3.722c0-.612-.498-1.11-1.11-1.11z" })),
        React.createElement("defs", null,
            React.createElement("clipPath", { id: "a" },
                React.createElement("path", { fill: "#fff", d: "M0 0h15v15H0z" })))));
});
ComputerDesktopSolid.displayName = "ComputerDesktopSolid";
export default ComputerDesktopSolid;
