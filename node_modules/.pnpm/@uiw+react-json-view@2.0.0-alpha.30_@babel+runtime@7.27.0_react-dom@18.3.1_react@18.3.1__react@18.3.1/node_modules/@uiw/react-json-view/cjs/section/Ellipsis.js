"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault")["default"];
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EllipsisComp = exports.Ellipsis = void 0;
var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));
var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));
var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));
var _Section = require("../store/Section");
var _useRender = require("../utils/useRender");
var _jsxRuntime = require("react/jsx-runtime");
var _excluded = ["as", "render"];
var Ellipsis = exports.Ellipsis = function Ellipsis(props) {
  var _useSectionStore = (0, _Section.useSectionStore)(),
    _useSectionStore$Elli = _useSectionStore.Ellipsis,
    Comp = _useSectionStore$Elli === void 0 ? {} : _useSectionStore$Elli;
  (0, _useRender.useSectionRender)(Comp, props, 'Ellipsis');
  return null;
};
Ellipsis.displayName = 'JVR.Ellipsis';
var EllipsisComp = exports.EllipsisComp = function EllipsisComp(_ref) {
  var isExpanded = _ref.isExpanded,
    value = _ref.value,
    keyName = _ref.keyName;
  var _useSectionStore2 = (0, _Section.useSectionStore)(),
    _useSectionStore2$Ell = _useSectionStore2.Ellipsis,
    Comp = _useSectionStore2$Ell === void 0 ? {} : _useSectionStore2$Ell;
  var as = Comp.as,
    render = Comp.render,
    reset = (0, _objectWithoutProperties2["default"])(Comp, _excluded);
  var Elm = as || 'span';
  var child = render && typeof render === 'function' && render((0, _objectSpread2["default"])((0, _objectSpread2["default"])({}, reset), {}, {
    'data-expanded': isExpanded
  }), {
    value: value,
    keyName: keyName
  });
  if (child) return child;
  if (!isExpanded || (0, _typeof2["default"])(value) === 'object' && Object.keys(value).length == 0) return null;
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(Elm, (0, _objectSpread2["default"])({}, reset));
};
EllipsisComp.displayName = 'JVR.EllipsisComp';