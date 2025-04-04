"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault")["default"];
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.KeyNameComp = exports.KeyName = void 0;
var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));
var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));
var _Section = require("../store/Section");
var _useRender = require("../utils/useRender");
var _jsxRuntime = require("react/jsx-runtime");
var _excluded = ["as", "render"];
var KeyName = exports.KeyName = function KeyName(props) {
  var _useSectionStore = (0, _Section.useSectionStore)(),
    _useSectionStore$KeyN = _useSectionStore.KeyName,
    Comp = _useSectionStore$KeyN === void 0 ? {} : _useSectionStore$KeyN;
  (0, _useRender.useSectionRender)(Comp, props, 'KeyName');
  return null;
};
KeyName.displayName = 'JVR.KeyName';
var KeyNameComp = exports.KeyNameComp = function KeyNameComp(props) {
  var children = props.children,
    value = props.value,
    parentValue = props.parentValue,
    keyName = props.keyName,
    keys = props.keys;
  var isNumber = typeof children === 'number';
  var style = {
    color: isNumber ? 'var(--w-rjv-key-number, #268bd2)' : 'var(--w-rjv-key-string, #002b36)'
  };
  var _useSectionStore2 = (0, _Section.useSectionStore)(),
    _useSectionStore2$Key = _useSectionStore2.KeyName,
    Comp = _useSectionStore2$Key === void 0 ? {} : _useSectionStore2$Key;
  var as = Comp.as,
    render = Comp.render,
    reset = (0, _objectWithoutProperties2["default"])(Comp, _excluded);
  reset.style = (0, _objectSpread2["default"])((0, _objectSpread2["default"])({}, reset.style), style);
  var Elm = as || 'span';
  var child = render && typeof render === 'function' && render((0, _objectSpread2["default"])((0, _objectSpread2["default"])({}, reset), {}, {
    children: children
  }), {
    value: value,
    parentValue: parentValue,
    keyName: keyName,
    keys: keys || (keyName ? [keyName] : [])
  });
  if (child) return child;
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(Elm, (0, _objectSpread2["default"])((0, _objectSpread2["default"])({}, reset), {}, {
    children: children
  }));
};
KeyNameComp.displayName = 'JVR.KeyNameComp';