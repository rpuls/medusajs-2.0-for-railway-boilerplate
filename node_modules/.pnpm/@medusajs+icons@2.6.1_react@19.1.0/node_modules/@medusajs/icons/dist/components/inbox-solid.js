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
const InboxSolid = React.forwardRef((_a, ref) => {
    var { color = "currentColor" } = _a, props = __rest(_a, ["color"]);
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("g", { fill: color, clipPath: "url(#a)" },
            React.createElement("path", { d: "M4.807 4.14a.667.667 0 0 0 0 .943l2.222 2.222a.665.665 0 0 0 .942 0l2.222-2.222a.667.667 0 1 0-.943-.943L8.166 5.225v-3.28a.667.667 0 0 0-1.334 0v3.279L5.748 4.139a.667.667 0 0 0-.943 0z" }),
            React.createElement("path", { d: "M12.563 2.828a2.43 2.43 0 0 0-2.275-1.55h-.122a.667.667 0 0 0 0 1.333h.122c.46 0 .865.277 1.033.705L12.965 7.5H9.944a.667.667 0 0 0-.667.667v.889c0 .122-.1.222-.222.222H5.944a.22.22 0 0 1-.223-.222v-.89a.667.667 0 0 0-.666-.666h-3.02l1.643-4.184a1.1 1.1 0 0 1 1.034-.705h.121a.667.667 0 0 0 0-1.333h-.121a2.43 2.43 0 0 0-2.276 1.55L.558 7.609a2.4 2.4 0 0 0-.17.895v2.774a2.446 2.446 0 0 0 2.445 2.444h9.334a2.446 2.446 0 0 0 2.444-2.444V8.504a2.4 2.4 0 0 0-.169-.895z" })),
        React.createElement("defs", null,
            React.createElement("clipPath", { id: "a" },
                React.createElement("path", { fill: "#fff", d: "M0 0h15v15H0z" })))));
});
InboxSolid.displayName = "InboxSolid";
export default InboxSolid;
