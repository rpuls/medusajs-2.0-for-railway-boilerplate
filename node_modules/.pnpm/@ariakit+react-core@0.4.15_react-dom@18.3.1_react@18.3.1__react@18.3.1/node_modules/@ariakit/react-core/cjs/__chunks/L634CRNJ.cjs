"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _JLMLKTUBcjs = require('./JLMLKTUB.cjs');

// src/heading/heading-level.tsx
var _react = require('react');
var _jsxruntime = require('react/jsx-runtime');
function HeadingLevel({ level, children }) {
  const contextLevel = _react.useContext.call(void 0, _JLMLKTUBcjs.HeadingContext);
  const nextLevel = Math.max(
    Math.min(level || contextLevel + 1, 6),
    1
  );
  return /* @__PURE__ */ _jsxruntime.jsx.call(void 0, _JLMLKTUBcjs.HeadingContext.Provider, { value: nextLevel, children });
}



exports.HeadingLevel = HeadingLevel;
