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
const SquaresPlusSolid = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("path", { fill: color, d: "M5.056 1.278H2.833c-.859 0-1.555.696-1.555 1.555v2.223c0 .859.696 1.555 1.555 1.555h2.223c.859 0 1.555-.696 1.555-1.555V2.833c0-.859-.696-1.555-1.555-1.555M12.167 1.278H9.944c-.859 0-1.555.696-1.555 1.555v2.223c0 .859.696 1.555 1.555 1.555h2.223c.859 0 1.555-.696 1.555-1.555V2.833c0-.859-.696-1.555-1.555-1.555M5.056 8.389H2.833c-.859 0-1.555.696-1.555 1.555v2.223c0 .859.696 1.555 1.555 1.555h2.223c.859 0 1.555-.696 1.555-1.555V9.944c0-.859-.696-1.555-1.555-1.555M13.278 10.167h-1.556V8.61a.667.667 0 0 0-1.333 0v1.556H8.833a.667.667 0 0 0 0 1.333h1.556v1.556a.667.667 0 0 0 1.333 0V11.5h1.556a.667.667 0 0 0 0-1.333" })));
});
SquaresPlusSolid.displayName = "SquaresPlusSolid";
export default SquaresPlusSolid;
