"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault")["default"];
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));
var _react = require("react");
var _ = _interopRequireDefault(require("../"));
var _KeyName = require("./KeyName");
var _store = require("./store");
var _jsxRuntime = require("react/jsx-runtime");
var _excluded = ["children", "onEdit", "editable"];
var JsonViewEditor = /*#__PURE__*/(0, _react.forwardRef)(function (props, ref) {
  var children = props.children,
    onEdit = props.onEdit,
    _props$editable = props.editable,
    editable = _props$editable === void 0 ? true : _props$editable,
    reset = (0, _objectWithoutProperties2["default"])(props, _excluded);
  var _useStoreReducer = (0, _store.useStoreReducer)({
      onEdit: onEdit
    }),
    _useStoreReducer2 = (0, _slicedToArray2["default"])(_useStoreReducer, 2),
    state = _useStoreReducer2[0],
    dispatch = _useStoreReducer2[1];
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_store.Context.Provider, {
    value: state,
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_store.Dispatch.Provider, {
      value: dispatch,
      children: /*#__PURE__*/(0, _jsxRuntime.jsxs)(_["default"], (0, _objectSpread2["default"])((0, _objectSpread2["default"])({}, reset), {}, {
        shortenTextAfterLength: 0,
        ref: ref,
        children: [editable && /*#__PURE__*/(0, _jsxRuntime.jsx)(_["default"].KeyName, {
          render: _KeyName.KeyNameRender
        }), children]
      }))
    })
  });
});
var _default = exports["default"] = JsonViewEditor;
module.exports = exports.default;