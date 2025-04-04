"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault")["default"];
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TriangleArrow = TriangleArrow;
var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));
var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));
var _react = _interopRequireDefault(require("react"));
var _jsxRuntime = require("react/jsx-runtime");
var _excluded = ["style"];
function TriangleArrow(props) {
  var style = props.style,
    reset = (0, _objectWithoutProperties2["default"])(props, _excluded);
  var defaultStyle = (0, _objectSpread2["default"])({
    cursor: 'pointer',
    height: '1em',
    width: '1em',
    userSelect: 'none',
    display: 'inline-flex'
  }, style);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)("svg", (0, _objectSpread2["default"])((0, _objectSpread2["default"])({
    viewBox: "0 0 24 24",
    fill: "var(--w-rjv-arrow-color, currentColor)",
    style: defaultStyle
  }, reset), {}, {
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)("path", {
      d: "M16.59 8.59 12 13.17 7.41 8.59 6 10l6 6 6-6z"
    })
  }));
}
TriangleArrow.displayName = 'JVR.TriangleArrow';