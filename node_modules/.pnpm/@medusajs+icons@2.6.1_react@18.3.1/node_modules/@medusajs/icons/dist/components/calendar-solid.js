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
const CalendarSolid = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("path", { fill: color, d: "M4.611 3.5a.667.667 0 0 1-.667-.667V1.056a.667.667 0 0 1 1.334 0v1.777a.667.667 0 0 1-.667.667M10.389 3.5a.667.667 0 0 1-.667-.667V1.056a.667.667 0 0 1 1.334 0v1.777a.667.667 0 0 1-.667.667" }),
        React.createElement("path", { fill: color, d: "M11.722 2.167H3.278A2.446 2.446 0 0 0 .833 4.61v7.556a2.446 2.446 0 0 0 2.445 2.444h8.444a2.447 2.447 0 0 0 2.445-2.444V4.61a2.446 2.446 0 0 0-2.445-2.444m0 11.11H3.278a1.113 1.113 0 0 1-1.111-1.11V6.61h10.666v5.556c0 .612-.498 1.11-1.11 1.11" }),
        React.createElement("path", { fill: color, d: "M7.5 7.722a.89.89 0 0 0-.889.89c0 .489.4.888.889.888.49 0 .889-.4.889-.889a.89.89 0 0 0-.889-.889M10.611 9.5c.49 0 .889-.4.889-.889a.89.89 0 0 0-.889-.889.89.89 0 0 0-.889.89c0 .489.4.888.89.888M7.5 10.389a.89.89 0 0 0-.889.889c0 .49.4.889.889.889a.89.89 0 0 0 0-1.778M4.389 10.389a.89.89 0 0 0-.889.889c0 .49.4.889.889.889a.89.89 0 0 0 0-1.778M10.611 10.389a.89.89 0 0 0-.889.889.89.89 0 0 0 1.778 0 .89.89 0 0 0-.889-.89" })));
});
CalendarSolid.displayName = "CalendarSolid";
export default CalendarSolid;
