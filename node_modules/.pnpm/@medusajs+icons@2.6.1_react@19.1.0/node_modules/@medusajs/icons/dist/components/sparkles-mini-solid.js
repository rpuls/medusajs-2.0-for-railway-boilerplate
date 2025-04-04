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
const SparklesMiniSolid = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("path", { fill: color, d: "m1.582 3.905 1.123.374.374 1.123a.446.446 0 0 0 .845 0l.374-1.123 1.122-.374a.445.445 0 0 0 0-.842l-1.122-.375-.374-1.122c-.122-.363-.722-.363-.844 0l-.374 1.122-1.123.375a.444.444 0 0 0 0 .842M13.418 11.063l-1.122-.375-.375-1.122c-.121-.363-.721-.363-.843 0l-.374 1.122-1.123.375a.444.444 0 0 0 0 .842l1.123.375.374 1.122a.446.446 0 0 0 .844 0l.374-1.122 1.123-.375a.445.445 0 0 0 0-.842M7.967 9.531l-1.801-.713-.713-1.802c-.202-.508-1.038-.508-1.24 0L3.5 8.818l-1.8.713a.668.668 0 0 0 0 1.24l1.8.712.713 1.802a.667.667 0 0 0 1.239 0l.713-1.802 1.8-.713a.667.667 0 0 0 .002-1.239M13.3 4.198l-1.8-.713-.714-1.802c-.201-.509-1.038-.509-1.24 0l-.713 1.802-1.8.713a.668.668 0 0 0 0 1.239l1.8.713.713 1.801a.667.667 0 0 0 1.24 0l.712-1.801 1.801-.713a.668.668 0 0 0 .001-1.24" })));
});
SparklesMiniSolid.displayName = "SparklesMiniSolid";
export default SparklesMiniSolid;
