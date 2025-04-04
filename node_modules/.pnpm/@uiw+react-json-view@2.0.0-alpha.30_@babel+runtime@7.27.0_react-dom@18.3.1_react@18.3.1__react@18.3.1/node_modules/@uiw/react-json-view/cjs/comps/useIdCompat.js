"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useIdCompat = useIdCompat;
var _react = require("react");
function useIdCompat() {
  var idRef = (0, _react.useRef)(null);
  if (idRef.current === null) {
    idRef.current = 'custom-id-' + Math.random().toString(36).substr(2, 9);
  }
  return idRef.current;
}