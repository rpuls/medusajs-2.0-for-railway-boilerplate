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
const BoltSolid = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("path", { fill: color, d: "M12.716 5.003a1.11 1.11 0 0 0-.994-.614H9.364l.967-2.487A1.113 1.113 0 0 0 9.296.389H5.589c-.464 0-.884.292-1.044.728l-2.12 5.779A1.112 1.112 0 0 0 3.47 8.388h3.369l-1.535 5.373a.666.666 0 0 0 1.174.583l6.135-8.177c.253-.339.293-.784.104-1.164" })));
});
BoltSolid.displayName = "BoltSolid";
export default BoltSolid;
