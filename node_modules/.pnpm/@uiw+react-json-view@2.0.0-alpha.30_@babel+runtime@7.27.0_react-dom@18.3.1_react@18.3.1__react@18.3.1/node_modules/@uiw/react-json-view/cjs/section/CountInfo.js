"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault")["default"];
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CountInfoComp = exports.CountInfo = void 0;
var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));
var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));
var _Section = require("../store/Section");
var _useRender = require("../utils/useRender");
var _store = require("../store");
var _jsxRuntime = require("react/jsx-runtime");
var _excluded = ["value", "keyName"],
  _excluded2 = ["as", "render"];
var CountInfo = exports.CountInfo = function CountInfo(props) {
  var _useSectionStore = (0, _Section.useSectionStore)(),
    _useSectionStore$Coun = _useSectionStore.CountInfo,
    Comp = _useSectionStore$Coun === void 0 ? {} : _useSectionStore$Coun;
  (0, _useRender.useSectionRender)(Comp, props, 'CountInfo');
  return null;
};
CountInfo.displayName = 'JVR.CountInfo';
var CountInfoComp = exports.CountInfoComp = function CountInfoComp(props) {
  var _props$value = props.value,
    value = _props$value === void 0 ? {} : _props$value,
    keyName = props.keyName,
    other = (0, _objectWithoutProperties2["default"])(props, _excluded);
  var _useStore = (0, _store.useStore)(),
    displayObjectSize = _useStore.displayObjectSize;
  var _useSectionStore2 = (0, _Section.useSectionStore)(),
    _useSectionStore2$Cou = _useSectionStore2.CountInfo,
    Comp = _useSectionStore2$Cou === void 0 ? {} : _useSectionStore2$Cou;
  if (!displayObjectSize) return null;
  var as = Comp.as,
    render = Comp.render,
    reset = (0, _objectWithoutProperties2["default"])(Comp, _excluded2);
  var Elm = as || 'span';
  reset.style = (0, _objectSpread2["default"])((0, _objectSpread2["default"])({}, reset.style), props.style);
  var len = Object.keys(value).length;
  if (!reset.children) {
    reset.children = "".concat(len, " item").concat(len === 1 ? '' : 's');
  }
  var elmProps = (0, _objectSpread2["default"])((0, _objectSpread2["default"])({}, reset), other);
  var isRender = render && typeof render === 'function';
  var child = isRender && render((0, _objectSpread2["default"])((0, _objectSpread2["default"])({}, elmProps), {}, {
    'data-length': len
  }), {
    value: value,
    keyName: keyName
  });
  if (child) return child;
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(Elm, (0, _objectSpread2["default"])({}, elmProps));
};
CountInfoComp.displayName = 'JVR.CountInfoComp';