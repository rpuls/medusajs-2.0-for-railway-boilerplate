import * as React from "react";
const Klaviyo = React.forwardRef((props, ref) => {
    return (React.createElement("svg", Object.assign({ xmlns: "http://www.w3.org/2000/svg", width: 15, height: 15, fill: "none", ref: ref }, props),
        React.createElement("path", { fill: "url(#a)", d: "M14.25 12H.75V3h13.5l-2.834 4.5z" }),
        React.createElement("defs", null,
            React.createElement("linearGradient", { id: "a", x1: 15.15, x2: -1.275, y1: 3.626, y2: 13.751, gradientUnits: "userSpaceOnUse" },
                React.createElement("stop", { stopColor: "#ED7598" }),
                React.createElement("stop", { offset: 0.456, stopColor: "#F75650" }),
                React.createElement("stop", { offset: 1, stopColor: "#FFA661" })))));
});
Klaviyo.displayName = "Klaviyo";
export default Klaviyo;
