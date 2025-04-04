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
const Folder = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("path", { stroke: color, strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M1.875 7.292V3.958c0-.92.746-1.666 1.667-1.666h1.626c.505 0 .983.229 1.3.623l.502.627h4.488c.921 0 1.667.746 1.667 1.666v2.37" }),
        React.createElement("path", { stroke: color, strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M3.542 5.625h7.916c.921 0 1.667.746 1.667 1.667v3.75c0 .92-.746 1.666-1.667 1.666H3.542c-.921 0-1.667-.745-1.667-1.666v-3.75c0-.921.746-1.667 1.667-1.667" })));
});
Folder.displayName = "Folder";
export default Folder;
