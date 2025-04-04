"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault")["default"];
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Expands = void 0;
exports.useExpands = useExpands;
exports.useExpandsDispatch = useExpandsDispatch;
exports.useExpandsStore = void 0;
var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));
var _react = require("react");
var _jsxRuntime = require("react/jsx-runtime");
var initialState = {};
var Context = /*#__PURE__*/(0, _react.createContext)(initialState);
var reducer = function reducer(state, action) {
  return (0, _objectSpread2["default"])((0, _objectSpread2["default"])({}, state), action);
};
var useExpandsStore = exports.useExpandsStore = function useExpandsStore() {
  return (0, _react.useContext)(Context);
};
var DispatchExpands = /*#__PURE__*/(0, _react.createContext)(function () {});
DispatchExpands.displayName = 'JVR.DispatchExpands';
function useExpands() {
  return (0, _react.useReducer)(reducer, initialState);
}
function useExpandsDispatch() {
  return (0, _react.useContext)(DispatchExpands);
}
var Expands = exports.Expands = function Expands(_ref) {
  var initial = _ref.initial,
    dispatch = _ref.dispatch,
    children = _ref.children;
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(Context.Provider, {
    value: initial,
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(DispatchExpands.Provider, {
      value: dispatch,
      children: children
    })
  });
};
Expands.displayName = 'JVR.Expands';