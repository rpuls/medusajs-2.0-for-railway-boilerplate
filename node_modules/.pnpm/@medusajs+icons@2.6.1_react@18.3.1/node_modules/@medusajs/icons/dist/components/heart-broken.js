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
const HeartBroken = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 16, height: 16, fill: "none", ref: ref }, props),
        React.createElement("g", { id: "heart-broken" },
            React.createElement("path", { d: "M8.24998 3.47314L6.4722 5.72203L10.0278 7.49981L8.24998 9.27759", stroke: color, strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5 }),
            React.createElement("path", { d: "M7.83132 13.0306C8.09532 13.1683 8.40376 13.1683 8.66776 13.0306C10.0633 12.3026 14.4713 9.66434 14.4713 5.37456C14.4784 3.49011 12.9567 1.95589 11.0704 1.94434C9.93532 1.95856 8.88021 2.531 8.24998 3.47322C7.61887 2.531 6.56376 1.95856 5.42954 1.94434C3.54243 1.95589 2.02154 3.49011 2.02865 5.37456C2.02865 9.66434 6.43576 12.3026 7.83132 13.0306Z", stroke: color, strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5 }))));
});
HeartBroken.displayName = "HeartBroken";
export default HeartBroken;
