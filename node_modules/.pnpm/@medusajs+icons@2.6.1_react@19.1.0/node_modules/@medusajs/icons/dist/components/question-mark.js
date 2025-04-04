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
const QuestionMark = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("g", { fill: color, clipPath: "url(#a)" },
            React.createElement("path", { d: "M7.594 4.807c-.538 0-1.018.247-1.234.835a.75.75 0 0 1-1.408-.517c.474-1.291 1.604-1.818 2.641-1.818 1.128 0 2.367.825 2.367 2.357 0 .538-.142.972-.395 1.33-.237.333-.543.554-.763.708l-.016.012c-.464.326-.639.449-.7.804a.75.75 0 1 1-1.478-.259c.172-.985.835-1.441 1.243-1.722l.09-.062c.214-.151.327-.246.4-.35.058-.08.119-.205.119-.46 0-.549-.403-.858-.867-.858M6.425 10.67a.89.89 0 0 0 1.778 0 .89.89 0 0 0-1.778 0" }),
            React.createElement("path", { fillRule: "evenodd", d: "M.306 7.5a7.194 7.194 0 1 1 14.389 0 7.194 7.194 0 0 1-14.39 0M7.5 1.805a5.694 5.694 0 1 0 0 11.39 5.694 5.694 0 0 0 0-11.39", clipRule: "evenodd" })),
        React.createElement("defs", null,
            React.createElement("clipPath", { id: "a" },
                React.createElement("path", { fill: "#fff", d: "M0 0h15v15H0z" })))));
});
QuestionMark.displayName = "QuestionMark";
export default QuestionMark;
