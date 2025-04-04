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
const CircleStackSolid = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("path", { fill: color, d: "M7.5.611c-3.092 0-6.222.916-6.222 2.667v8.444c0 1.751 3.13 2.667 6.222 2.667s6.222-.916 6.222-2.667V3.278C13.722 1.527 10.592.61 7.5.61M12.39 7.5c0 .388-1.713 1.333-4.889 1.333S2.611 7.888 2.611 7.5V4.985c1.2.632 3.048.96 4.889.96 1.84 0 3.69-.328 4.889-.96zM7.5 13.056c-3.176 0-4.889-.946-4.889-1.334V9.208c1.2.632 3.048.959 4.889.959 1.84 0 3.69-.327 4.889-.96v2.515c0 .388-1.713 1.334-4.889 1.334" })));
});
CircleStackSolid.displayName = "CircleStackSolid";
export default CircleStackSolid;
