"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault")["default"];
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useStore = exports.Dispatch = exports.Context = void 0;
exports.useStoreReducer = useStoreReducer;
var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));
var _react = require("react");
var initialState = {};
var Context = exports.Context = /*#__PURE__*/(0, _react.createContext)(initialState);
var reducer = function reducer(state, action) {
  return (0, _objectSpread2["default"])((0, _objectSpread2["default"])({}, state), action);
};
var Dispatch = exports.Dispatch = /*#__PURE__*/(0, _react.createContext)(function () {});
Dispatch.displayName = 'JVR.Editor.Dispatch';
var useStore = exports.useStore = function useStore() {
  return (0, _react.useContext)(Context);
};
function useStoreReducer(initialState) {
  return (0, _react.useReducer)(reducer, initialState);
}