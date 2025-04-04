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
const UsersSolid = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("g", { fill: color, clipPath: "url(#a)" },
            React.createElement("path", { d: "M4.792 7.5a2.292 2.292 0 1 0 0-4.583 2.292 2.292 0 0 0 0 4.583M10 5.417a2.292 2.292 0 1 0 0-4.584 2.292 2.292 0 0 0 0 4.584M14.33 9.248A4.65 4.65 0 0 0 10 6.25c-1.18 0-2.293.46-3.133 1.233 1.545.591 2.821 1.808 3.425 3.408.093.246.135.502.151.758a10.8 10.8 0 0 0 2.971-.538c.38-.127.695-.406.868-.766.166-.35.184-.74.049-1.097zM9.122 11.332a4.65 4.65 0 0 0-4.33-2.999 4.65 4.65 0 0 0-4.33 2.999c-.135.357-.118.746.049 1.096.172.36.487.64.867.766a10.77 10.77 0 0 0 6.827 0c.38-.127.695-.406.868-.766.166-.35.184-.74.049-1.096" })),
        React.createElement("defs", null,
            React.createElement("clipPath", { id: "a" },
                React.createElement("path", { fill: "#fff", d: "M0 0h15v15H0z" })))));
});
UsersSolid.displayName = "UsersSolid";
export default UsersSolid;
