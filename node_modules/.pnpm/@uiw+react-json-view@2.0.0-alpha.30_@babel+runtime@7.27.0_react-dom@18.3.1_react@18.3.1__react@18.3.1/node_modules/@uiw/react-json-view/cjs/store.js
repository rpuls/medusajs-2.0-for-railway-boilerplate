"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard")["default"];
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault")["default"];
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initialState = exports.Provider = exports.Context = void 0;
exports.reducer = reducer;
exports.useDispatch = useDispatch;
exports.useStore = exports.useDispatchStore = void 0;
var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));
var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));
var _react = _interopRequireWildcard(require("react"));
var _ShowTools = require("./store/ShowTools");
var _Expands = require("./store/Expands");
var _Types = require("./store/Types");
var _Symbols = require("./store/Symbols");
var _Section = require("./store/Section");
var _jsxRuntime = require("react/jsx-runtime");
var initialState = exports.initialState = {
  objectSortKeys: false,
  indentWidth: 15
};
var Context = exports.Context = /*#__PURE__*/(0, _react.createContext)(initialState);
Context.displayName = 'JVR.Context';
var DispatchContext = /*#__PURE__*/(0, _react.createContext)(function () {});
DispatchContext.displayName = 'JVR.DispatchContext';
function reducer(state, action) {
  return (0, _objectSpread2["default"])((0, _objectSpread2["default"])({}, state), action);
}
var useStore = exports.useStore = function useStore() {
  return (0, _react.useContext)(Context);
};
var useDispatchStore = exports.useDispatchStore = function useDispatchStore() {
  return (0, _react.useContext)(DispatchContext);
};
var Provider = exports.Provider = function Provider(_ref) {
  var children = _ref.children,
    init = _ref.initialState,
    initialTypes = _ref.initialTypes;
  var _useReducer = (0, _react.useReducer)(reducer, Object.assign({}, initialState, init)),
    _useReducer2 = (0, _slicedToArray2["default"])(_useReducer, 2),
    state = _useReducer2[0],
    dispatch = _useReducer2[1];
  var _useShowTools = (0, _ShowTools.useShowTools)(),
    _useShowTools2 = (0, _slicedToArray2["default"])(_useShowTools, 2),
    showTools = _useShowTools2[0],
    showToolsDispatch = _useShowTools2[1];
  var _useExpands = (0, _Expands.useExpands)(),
    _useExpands2 = (0, _slicedToArray2["default"])(_useExpands, 2),
    expands = _useExpands2[0],
    expandsDispatch = _useExpands2[1];
  var _useTypes = (0, _Types.useTypes)(),
    _useTypes2 = (0, _slicedToArray2["default"])(_useTypes, 2),
    types = _useTypes2[0],
    typesDispatch = _useTypes2[1];
  var _useSymbols = (0, _Symbols.useSymbols)(),
    _useSymbols2 = (0, _slicedToArray2["default"])(_useSymbols, 2),
    symbols = _useSymbols2[0],
    symbolsDispatch = _useSymbols2[1];
  var _useSection = (0, _Section.useSection)(),
    _useSection2 = (0, _slicedToArray2["default"])(_useSection, 2),
    section = _useSection2[0],
    sectionDispatch = _useSection2[1];
  (0, _react.useEffect)(function () {
    return dispatch((0, _objectSpread2["default"])({}, init));
  }, [init]);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(Context.Provider, {
    value: state,
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(DispatchContext.Provider, {
      value: dispatch,
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_ShowTools.ShowTools, {
        initial: showTools,
        dispatch: showToolsDispatch,
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Expands.Expands, {
          initial: expands,
          dispatch: expandsDispatch,
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Types.Types, {
            initial: (0, _objectSpread2["default"])((0, _objectSpread2["default"])({}, types), initialTypes),
            dispatch: typesDispatch,
            children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Symbols.Symbols, {
              initial: symbols,
              dispatch: symbolsDispatch,
              children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Section.Section, {
                initial: section,
                dispatch: sectionDispatch,
                children: children
              })
            })
          })
        })
      })
    })
  });
};
function useDispatch() {
  return (0, _react.useContext)(DispatchContext);
}
Provider.displayName = 'JVR.Provider';