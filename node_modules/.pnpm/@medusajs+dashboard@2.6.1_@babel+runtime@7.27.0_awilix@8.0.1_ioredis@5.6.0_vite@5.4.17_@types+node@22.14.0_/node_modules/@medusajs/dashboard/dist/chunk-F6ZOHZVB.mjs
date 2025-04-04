// src/components/utilities/visually-hidden/visually-hidden.tsx
import { jsx } from "react/jsx-runtime";
var VisuallyHidden = ({ children }) => {
  return /* @__PURE__ */ jsx("span", { className: "sr-only", children });
};

export {
  VisuallyHidden
};
