import _extends from "@babel/runtime/helpers/extends";
import { createContext, useContext, useReducer } from 'react';
var initialState = {};
export var Context = /*#__PURE__*/createContext(initialState);
var reducer = (state, action) => _extends({}, state, action);
export var Dispatch = /*#__PURE__*/createContext(() => {});
Dispatch.displayName = 'JVR.Editor.Dispatch';
export var useStore = () => {
  return useContext(Context);
};
export function useStoreReducer(initialState) {
  return useReducer(reducer, initialState);
}