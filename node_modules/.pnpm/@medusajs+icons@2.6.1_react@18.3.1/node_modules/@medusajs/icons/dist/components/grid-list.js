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
const GridList = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("path", { stroke: color, strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M8.611 2.834h4.445M8.611 5.5h4.445M8.611 9.5h4.445M8.611 12.167h4.445M5.056 1.944H2.833a.89.89 0 0 0-.889.89v2.221c0 .491.398.89.89.89h2.222c.49 0 .888-.399.888-.89V2.833a.89.89 0 0 0-.888-.889M5.056 9.056H2.833a.89.89 0 0 0-.889.889v2.222c0 .49.398.889.89.889h2.222c.49 0 .888-.398.888-.89V9.946a.89.89 0 0 0-.888-.89" })));
});
GridList.displayName = "GridList";
export default GridList;
