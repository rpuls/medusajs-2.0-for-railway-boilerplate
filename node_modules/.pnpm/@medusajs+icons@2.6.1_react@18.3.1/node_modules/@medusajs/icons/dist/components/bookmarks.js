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
const Bookmarks = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("path", { stroke: color, strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "m10.389 13.944-4.222-3.11-4.223 3.11V5.5c0-.982.796-1.778 1.778-1.778h4.89c.981 0 1.777.796 1.777 1.778z" }),
        React.createElement("path", { stroke: color, strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M5.528 1.278c.255-.141.548-.222.86-.222h4.89c.982 0 1.778.795 1.778 1.777v8.445" })));
});
Bookmarks.displayName = "Bookmarks";
export default Bookmarks;
