"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault")["default"];
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useSectionRender = useSectionRender;
exports.useSymbolsRender = useSymbolsRender;
exports.useTypesRender = useTypesRender;
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));
var _react = require("react");
var _Symbols = require("../store/Symbols");
var _Types = require("../store/Types");
var _Section = require("../store/Section");
function useSymbolsRender(currentProps, props, key) {
  var dispatch = (0, _Symbols.useSymbolsDispatch)();
  var cls = [currentProps.className, props.className].filter(Boolean).join(' ');
  var reset = (0, _objectSpread2["default"])((0, _objectSpread2["default"])((0, _objectSpread2["default"])({}, currentProps), props), {}, {
    className: cls,
    style: (0, _objectSpread2["default"])((0, _objectSpread2["default"])({}, currentProps.style), props.style),
    children: props.children || currentProps.children
  });
  (0, _react.useEffect)(function () {
    return dispatch((0, _defineProperty2["default"])({}, key, reset));
  }, [props]);
}
function useTypesRender(currentProps, props, key) {
  var dispatch = (0, _Types.useTypesDispatch)();
  var cls = [currentProps.className, props.className].filter(Boolean).join(' ');
  var reset = (0, _objectSpread2["default"])((0, _objectSpread2["default"])((0, _objectSpread2["default"])({}, currentProps), props), {}, {
    className: cls,
    style: (0, _objectSpread2["default"])((0, _objectSpread2["default"])({}, currentProps.style), props.style),
    children: props.children || currentProps.children
  });
  (0, _react.useEffect)(function () {
    return dispatch((0, _defineProperty2["default"])({}, key, reset));
  }, [props]);
}
function useSectionRender(currentProps, props, key) {
  var dispatch = (0, _Section.useSectionDispatch)();
  var cls = [currentProps.className, props.className].filter(Boolean).join(' ');
  var reset = (0, _objectSpread2["default"])((0, _objectSpread2["default"])((0, _objectSpread2["default"])({}, currentProps), props), {}, {
    className: cls,
    style: (0, _objectSpread2["default"])((0, _objectSpread2["default"])({}, currentProps.style), props.style),
    children: props.children || currentProps.children
  });
  (0, _react.useEffect)(function () {
    return dispatch((0, _defineProperty2["default"])({}, key, reset));
  }, [props]);
}