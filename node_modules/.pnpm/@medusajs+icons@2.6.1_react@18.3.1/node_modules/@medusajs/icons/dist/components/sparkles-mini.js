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
const SparklesMini = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("path", { stroke: color, strokeWidth: 1.5, d: "m3.584 2.926.119.355.355.119.253.084-.252.084-.356.119-.118.355-.085.255-.085-.255-.119-.355-.355-.119-.252-.084.252-.084.355-.119.119-.355.085-.254zM12.058 11.4l.253.084-.252.084-.355.119-.12.355-.084.255-.085-.255-.119-.355-.355-.119-.252-.084.252-.084.355-.119.119-.356.085-.253.084.253.119.356z" }),
        React.createElement("path", { stroke: color, strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "m4.833 7.262.819 2.07 2.07.819-2.07.818-.819 2.07-.818-2.07-2.07-.818 2.07-.82zM10.167 1.928l.818 2.07 2.07.82-2.07.818-.818 2.07-.819-2.07-2.07-.819L9.348 4z" })));
});
SparklesMini.displayName = "SparklesMini";
export default SparklesMini;
