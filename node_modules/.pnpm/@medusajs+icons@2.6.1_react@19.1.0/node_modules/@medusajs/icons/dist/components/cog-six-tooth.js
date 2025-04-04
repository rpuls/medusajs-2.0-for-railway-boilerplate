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
const CogSixTooth = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("g", { stroke: color, strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, clipPath: "url(#a)" },
            React.createElement("path", { d: "M7.5 9.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4" }),
            React.createElement("path", { d: "m12.989 5.97-.826-.292a5 5 0 0 0-.323-.685 5 5 0 0 0-.43-.621l.16-.86a1.43 1.43 0 0 0-.692-1.503l-.312-.18a1.43 1.43 0 0 0-1.647.152l-.663.566a5 5 0 0 0-1.513 0L6.08 1.98a1.43 1.43 0 0 0-1.647-.152l-.312.18a1.43 1.43 0 0 0-.691 1.503l.16.857c-.32.4-.574.841-.758 1.31l-.82.29a1.43 1.43 0 0 0-.956 1.35v.36c0 .608.383 1.15.955 1.35l.826.292c.09.232.194.462.323.684.128.222.275.427.43.622l-.16.86c-.111.597.166 1.2.691 1.503l.312.18a1.43 1.43 0 0 0 1.647-.152l.663-.567a5 5 0 0 0 1.512 0l.663.568a1.43 1.43 0 0 0 1.647.152l.312-.18c.526-.304.803-.906.691-1.502l-.16-.86c.32-.398.575-.84.757-1.308l.822-.29c.572-.202.956-.743.956-1.35v-.36c0-.608-.383-1.149-.956-1.35z" })),
        React.createElement("defs", null,
            React.createElement("clipPath", { id: "a" },
                React.createElement("path", { fill: "#fff", d: "M0 0h15v15H0z" })))));
});
CogSixTooth.displayName = "CogSixTooth";
export default CogSixTooth;
