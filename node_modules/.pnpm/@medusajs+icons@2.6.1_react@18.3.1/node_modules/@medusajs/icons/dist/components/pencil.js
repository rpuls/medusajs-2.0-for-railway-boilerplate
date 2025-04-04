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
const Pencil = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("path", { stroke: color, strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "m11.903 6.236.985-.986c.521-.52.521-1.365 0-1.885l-1.252-1.253a1.333 1.333 0 0 0-1.885 0l-.986.986zM7.43 4.43 3.187 8.676c-.222.222-.381.5-.462.804l-1.002 3.798 3.798-1.002c.304-.08.582-.24.804-.462l4.244-4.245M8.986 5.986 5.07 9.904" })));
});
Pencil.displayName = "Pencil";
export default Pencil;
