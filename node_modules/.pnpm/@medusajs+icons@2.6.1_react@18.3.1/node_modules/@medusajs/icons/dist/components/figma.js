import * as React from "react";
const Figma = React.forwardRef((props, ref) => {
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("g", { clipPath: "url(#a)" },
            React.createElement("path", { fill: "#1ABCFE", d: "M7.5 7.5a2.227 2.227 0 1 1 4.454 0 2.227 2.227 0 0 1-4.454 0" }),
            React.createElement("path", { fill: "#0ACF83", d: "M3.046 11.954c0-1.23.997-2.227 2.227-2.227H7.5v2.227a2.227 2.227 0 1 1-4.454 0" }),
            React.createElement("path", { fill: "#FF7262", d: "M7.5.819v4.454h2.227a2.227 2.227 0 1 0 0-4.454z" }),
            React.createElement("path", { fill: "#F24E1E", d: "M3.046 3.046c0 1.23.997 2.227 2.227 2.227H7.5V.819H5.273c-1.23 0-2.227.997-2.227 2.227" }),
            React.createElement("path", { fill: "#A259FF", d: "M3.046 7.5c0 1.23.997 2.227 2.227 2.227H7.5V5.273H5.273c-1.23 0-2.227.997-2.227 2.227" })),
        React.createElement("defs", null,
            React.createElement("clipPath", { id: "a" },
                React.createElement("path", { fill: "#fff", d: "M3 .75h9v13.5H3z" })))));
});
Figma.displayName = "Figma";
export default Figma;
