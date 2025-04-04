"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault")["default"];
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CountInfoExtraComps = exports.CountInfoExtra = void 0;
var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));
var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));
var _Section = require("../store/Section");
var _useRender = require("../utils/useRender");
var _jsxRuntime = require("react/jsx-runtime");
var _excluded = ["value", "keyName"],
  _excluded2 = ["as", "render"];
var CountInfoExtra = exports.CountInfoExtra = function CountInfoExtra(props) {
  var _useSectionStore = (0, _Section.useSectionStore)(),
    _useSectionStore$Coun = _useSectionStore.CountInfoExtra,
    Comp = _useSectionStore$Coun === void 0 ? {} : _useSectionStore$Coun;
  (0, _useRender.useSectionRender)(Comp, props, 'CountInfoExtra');
  return null;
};
CountInfoExtra.displayName = 'JVR.CountInfoExtra';
var CountInfoExtraComps = exports.CountInfoExtraComps = function CountInfoExtraComps(props) {
  var _props$value = props.value,
    value = _props$value === void 0 ? {} : _props$value,
    keyName = props.keyName,
    other = (0, _objectWithoutProperties2["default"])(props, _excluded);
  var _useSectionStore2 = (0, _Section.useSectionStore)(),
    _useSectionStore2$Cou = _useSectionStore2.CountInfoExtra,
    Comp = _useSectionStore2$Cou === void 0 ? {} : _useSectionStore2$Cou;
  var as = Comp.as,
    render = Comp.render,
    reset = (0, _objectWithoutProperties2["default"])(Comp, _excluded2);
  if (!render && !reset.children) return null;
  var Elm = as || 'span';
  var isRender = render && typeof render === 'function';
  var elmProps = (0, _objectSpread2["default"])((0, _objectSpread2["default"])({}, reset), other);
  var child = isRender && render(elmProps, {
    value: value,
    keyName: keyName
  });
  if (child) return child;
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(Elm, (0, _objectSpread2["default"])({}, elmProps));
};
CountInfoExtraComps.displayName = 'JVR.CountInfoExtraComps';