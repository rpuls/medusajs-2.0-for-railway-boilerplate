"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault")["default"];
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.KeyNameRender = void 0;
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));
var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));
var _react = require("react");
var _store = require("./store");
var _jsxRuntime = require("react/jsx-runtime");
var _excluded = ["children"],
  _excluded2 = ["value", "parentValue", "keyName"];
var KeyNameRender = exports.KeyNameRender = function KeyNameRender(_ref, _ref2) {
  var children = _ref.children,
    reset = (0, _objectWithoutProperties2["default"])(_ref, _excluded);
  var value = _ref2.value,
    parentValue = _ref2.parentValue,
    keyName = _ref2.keyName;
  if (typeof children === 'number') {
    return /*#__PURE__*/(0, _jsxRuntime.jsx)("span", (0, _objectSpread2["default"])((0, _objectSpread2["default"])({}, reset), {}, {
      children: children
    }));
  }
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(Child, (0, _objectSpread2["default"])((0, _objectSpread2["default"])({}, reset), {}, {
    value: value,
    parentValue: parentValue,
    keyName: keyName,
    children: children
  }));
};
var Child = function Child(props) {
  var value = props.value,
    parentValue = props.parentValue,
    keyName = props.keyName,
    reset = (0, _objectWithoutProperties2["default"])(props, _excluded2);
  var $dom = (0, _react.useRef)(null);
  var _useState = (0, _react.useState)(props.children),
    _useState2 = (0, _slicedToArray2["default"])(_useState, 2),
    currentValue = _useState2[0],
    setCurrentValue = _useState2[1];
  var _useStore = (0, _store.useStore)(),
    onEdit = _useStore.onEdit;
  var onKeyDown = function onKeyDown(evn) {
    if (evn.key === 'Enter') {
      var _$dom$current;
      (_$dom$current = $dom.current) === null || _$dom$current === void 0 || _$dom$current.setAttribute('contentEditable', 'false');
    }
  };
  var onClick = function onClick(evn) {
    var _$dom$current2, _$dom$current3;
    evn.stopPropagation();
    (_$dom$current2 = $dom.current) === null || _$dom$current2 === void 0 || _$dom$current2.setAttribute('contentEditable', 'true');
    (_$dom$current3 = $dom.current) === null || _$dom$current3 === void 0 || _$dom$current3.focus();
  };
  var onBlur = function onBlur(evn) {
    var _$dom$current4;
    (_$dom$current4 = $dom.current) === null || _$dom$current4 === void 0 || _$dom$current4.setAttribute('contentEditable', 'false');
    var callback = onEdit && onEdit({
      value: evn.target.textContent,
      oldValue: value,
      keyName: keyName
    });
    if (callback) {
      setCurrentValue(evn.target.textContent);
    }
  };
  var spanProps = (0, _objectSpread2["default"])((0, _objectSpread2["default"])({}, reset), {}, {
    onKeyDown: onKeyDown,
    onClick: onClick,
    onBlur: onBlur,
    spellCheck: false,
    contentEditable: 'false',
    suppressContentEditableWarning: true,
    children: currentValue
  });
  return /*#__PURE__*/(0, _jsxRuntime.jsx)("span", (0, _objectSpread2["default"])((0, _objectSpread2["default"])({}, spanProps), {}, {
    ref: $dom
  }));
};