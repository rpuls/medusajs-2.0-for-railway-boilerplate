"use client";
import {
  HeadingContext
} from "./CZ4GFWYL.js";

// src/heading/heading-level.tsx
import { useContext } from "react";
import { jsx } from "react/jsx-runtime";
function HeadingLevel({ level, children }) {
  const contextLevel = useContext(HeadingContext);
  const nextLevel = Math.max(
    Math.min(level || contextLevel + 1, 6),
    1
  );
  return /* @__PURE__ */ jsx(HeadingContext.Provider, { value: nextLevel, children });
}

export {
  HeadingLevel
};
