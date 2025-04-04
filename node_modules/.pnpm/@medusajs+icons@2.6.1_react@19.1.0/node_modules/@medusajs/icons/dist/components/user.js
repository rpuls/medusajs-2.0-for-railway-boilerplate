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
const User = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("path", { stroke: color, strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M7.5 5.944a2.444 2.444 0 1 0 0-4.888 2.444 2.444 0 0 0 0 4.888M11.733 13.292c.764-.24 1.166-1.085.842-1.818A5.55 5.55 0 0 0 7.5 8.167a5.55 5.55 0 0 0-5.075 3.307c-.324.733.078 1.577.842 1.818a14.1 14.1 0 0 0 8.466 0" })));
});
User.displayName = "User";
export default User;
