"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault")["default"];
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ShowTools = void 0;
exports.useShowTools = useShowTools;
exports.useShowToolsDispatch = useShowToolsDispatch;
exports.useShowToolsStore = void 0;
var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));
var _react = require("react");
var _jsxRuntime = require("react/jsx-runtime");
var initialState = {};
var Context = /*#__PURE__*/(0, _react.createContext)(initialState);
var reducer = function reducer(state, action) {
  return (0, _objectSpread2["default"])((0, _objectSpread2["default"])({}, state), action);
};
var useShowToolsStore = exports.useShowToolsStore = function useShowToolsStore() {
  return (0, _react.useContext)(Context);
};
var DispatchShowTools = /*#__PURE__*/(0, _react.createContext)(function () {});
DispatchShowTools.displayName = 'JVR.DispatchShowTools';
function useShowTools() {
  return (0, _react.useReducer)(reducer, initialState);
}
function useShowToolsDispatch() {
  return (0, _react.useContext)(DispatchShowTools);
}
var ShowTools = exports.ShowTools = function ShowTools(_ref) {
  var initial = _ref.initial,
    dispatch = _ref.dispatch,
    children = _ref.children;
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(Context.Provider, {
    value: initial,
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(DispatchShowTools.Provider, {
      value: dispatch,
      children: children
    })
  });
};
ShowTools.displayName = 'JVR.ShowTools';