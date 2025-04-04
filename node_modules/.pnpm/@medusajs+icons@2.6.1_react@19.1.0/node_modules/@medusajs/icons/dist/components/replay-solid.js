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
const ReplaySolid = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("path", { fill: color, d: "M12.67 2.535a1.34 1.34 0 0 0-1.348-.018L4.445 6.325A1.35 1.35 0 0 0 3.75 7.5c0 .488.266.938.694 1.175l6.879 3.808a1.35 1.35 0 0 0 1.349-.018 1.33 1.33 0 0 0 .662-1.156V3.692c0-.48-.247-.912-.662-1.156zM2.292 1.667a.625.625 0 0 0-.625.625v10.416a.625.625 0 0 0 1.25 0V2.292a.625.625 0 0 0-.625-.625" })));
});
ReplaySolid.displayName = "ReplaySolid";
export default ReplaySolid;
