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
const QuestionMarkCircle = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("g", { fill: color, clipPath: "url(#a)" },
            React.createElement("path", { d: "M7.593 4.807c-.538 0-1.018.247-1.234.835a.75.75 0 0 1-1.408-.517c.474-1.291 1.605-1.818 2.642-1.818 1.127 0 2.366.825 2.366 2.357 0 .538-.141.973-.394 1.33-.237.333-.543.554-.763.709l-.016.011c-.464.326-.639.449-.701.804a.75.75 0 1 1-1.478-.259c.173-.984.836-1.44 1.244-1.722l.089-.062c.215-.15.328-.245.401-.35.058-.08.118-.205.118-.46 0-.548-.402-.858-.866-.858M6.425 10.67a.89.89 0 0 0 1.778 0 .89.89 0 0 0-1.778 0" }),
            React.createElement("path", { fillRule: "evenodd", d: "M.305 7.5a7.194 7.194 0 1 1 14.39 0 7.194 7.194 0 0 1-14.39 0M7.5 1.806a5.694 5.694 0 1 0 0 11.389 5.694 5.694 0 0 0 0-11.39", clipRule: "evenodd" })),
        React.createElement("defs", null,
            React.createElement("clipPath", { id: "a" },
                React.createElement("path", { fill: "#fff", d: "M0 0h15v15H0z" })))));
});
QuestionMarkCircle.displayName = "QuestionMarkCircle";
export default QuestionMarkCircle;
