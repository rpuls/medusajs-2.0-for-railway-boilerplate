"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault")["default"];
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RowComp = exports.Row = void 0;
var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));
var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));
var _Section = require("../store/Section");
var _useRender = require("../utils/useRender");
var _jsxRuntime = require("react/jsx-runtime");
var _excluded = ["children", "value", "parentValue", "keyName", "keys"],
  _excluded2 = ["as", "render", "children"];
var Row = exports.Row = function Row(props) {
  var _useSectionStore = (0, _Section.useSectionStore)(),
    _useSectionStore$Row = _useSectionStore.Row,
    Comp = _useSectionStore$Row === void 0 ? {} : _useSectionStore$Row;
  (0, _useRender.useSectionRender)(Comp, props, 'Row');
  return null;
};
Row.displayName = 'JVR.Row';
var RowComp = exports.RowComp = function RowComp(props) {
  var children = props.children,
    value = props.value,
    parentValue = props.parentValue,
    keyName = props.keyName,
    keys = props.keys,
    other = (0, _objectWithoutProperties2["default"])(props, _excluded);
  var _useSectionStore2 = (0, _Section.useSectionStore)(),
    _useSectionStore2$Row = _useSectionStore2.Row,
    Comp = _useSectionStore2$Row === void 0 ? {} : _useSectionStore2$Row;
  var as = Comp.as,
    render = Comp.render,
    _ = Comp.children,
    reset = (0, _objectWithoutProperties2["default"])(Comp, _excluded2);
  var Elm = as || 'div';
  var child = render && typeof render === 'function' && render((0, _objectSpread2["default"])((0, _objectSpread2["default"])((0, _objectSpread2["default"])({}, other), reset), {}, {
    children: children
  }), {
    value: value,
    keyName: keyName,
    parentValue: parentValue,
    keys: keys
  });
  if (child) return child;
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(Elm, (0, _objectSpread2["default"])((0, _objectSpread2["default"])((0, _objectSpread2["default"])({}, other), reset), {}, {
    children: children
  }));
};
RowComp.displayName = 'JVR.RowComp';