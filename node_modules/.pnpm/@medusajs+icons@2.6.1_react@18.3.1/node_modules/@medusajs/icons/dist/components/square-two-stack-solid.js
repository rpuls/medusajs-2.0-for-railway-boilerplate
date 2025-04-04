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
const SquareTwoStackSolid = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("path", { fill: color, d: "M12.167 4.833h-2v-2c0-.857-.698-1.555-1.556-1.555H2.833c-.857 0-1.555.698-1.555 1.555v5.778c0 .858.698 1.556 1.555 1.556h2v2c0 .857.698 1.555 1.556 1.555h5.778c.857 0 1.555-.697 1.555-1.555V6.389c0-.858-.697-1.556-1.555-1.556" })));
});
SquareTwoStackSolid.displayName = "SquareTwoStackSolid";
export default SquareTwoStackSolid;
