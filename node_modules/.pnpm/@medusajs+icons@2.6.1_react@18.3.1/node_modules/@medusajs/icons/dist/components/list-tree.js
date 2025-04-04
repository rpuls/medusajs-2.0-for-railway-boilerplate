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
const ListTree = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("path", { stroke: color, strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M11.278 2.253H9.056a.89.89 0 0 0-.89.889v2.222c0 .49.399.889.89.889h2.222c.49 0 .889-.398.889-.89V3.143a.89.89 0 0 0-.89-.89M11.278 9.364H9.056a.89.89 0 0 0-.89.889v2.222c0 .49.399.889.89.889h2.222c.49 0 .889-.398.889-.89v-2.221a.89.89 0 0 0-.89-.89M5.944 4.475H4.167a1.334 1.334 0 0 1-1.334-1.333V.919" }),
        React.createElement("path", { stroke: color, strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M5.944 11.586H4.167a1.334 1.334 0 0 1-1.334-1.333V2.919" })));
});
ListTree.displayName = "ListTree";
export default ListTree;
