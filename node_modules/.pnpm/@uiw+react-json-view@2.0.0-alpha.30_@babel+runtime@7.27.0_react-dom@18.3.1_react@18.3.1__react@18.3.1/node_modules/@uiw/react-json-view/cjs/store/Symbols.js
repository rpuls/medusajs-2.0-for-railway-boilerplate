"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault")["default"];
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Symbols = void 0;
exports.useSymbols = useSymbols;
exports.useSymbolsDispatch = useSymbolsDispatch;
exports.useSymbolsStore = void 0;
var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));
var _react = require("react");
var _TriangleArrow = require("../arrow/TriangleArrow");
var _jsxRuntime = require("react/jsx-runtime");
var initialState = {
  Arrow: {
    as: 'span',
    className: 'w-rjv-arrow',
    style: {
      transform: 'rotate(0deg)',
      transition: 'all 0.3s'
    },
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_TriangleArrow.TriangleArrow, {})
  },
  Colon: {
    as: 'span',
    style: {
      color: 'var(--w-rjv-colon-color, var(--w-rjv-color))',
      marginLeft: 0,
      marginRight: 2
    },
    className: 'w-rjv-colon',
    children: ':'
  },
  Quote: {
    as: 'span',
    style: {
      color: 'var(--w-rjv-quotes-color, #236a7c)'
    },
    className: 'w-rjv-quotes',
    children: '"'
  },
  ValueQuote: {
    as: 'span',
    style: {
      color: 'var(--w-rjv-quotes-string-color, #cb4b16)'
    },
    className: 'w-rjv-quotes',
    children: '"'
  },
  BracketsLeft: {
    as: 'span',
    style: {
      color: 'var(--w-rjv-brackets-color, #236a7c)'
    },
    className: 'w-rjv-brackets-start',
    children: '['
  },
  BracketsRight: {
    as: 'span',
    style: {
      color: 'var(--w-rjv-brackets-color, #236a7c)'
    },
    className: 'w-rjv-brackets-end',
    children: ']'
  },
  BraceLeft: {
    as: 'span',
    style: {
      color: 'var(--w-rjv-curlybraces-color, #236a7c)'
    },
    className: 'w-rjv-curlybraces-start',
    children: '{'
  },
  BraceRight: {
    as: 'span',
    style: {
      color: 'var(--w-rjv-curlybraces-color, #236a7c)'
    },
    className: 'w-rjv-curlybraces-end',
    children: '}'
  }
};
var Context = /*#__PURE__*/(0, _react.createContext)(initialState);
var reducer = function reducer(state, action) {
  return (0, _objectSpread2["default"])((0, _objectSpread2["default"])({}, state), action);
};
var useSymbolsStore = exports.useSymbolsStore = function useSymbolsStore() {
  return (0, _react.useContext)(Context);
};
var DispatchSymbols = /*#__PURE__*/(0, _react.createContext)(function () {});
DispatchSymbols.displayName = 'JVR.DispatchSymbols';
function useSymbols() {
  return (0, _react.useReducer)(reducer, initialState);
}
function useSymbolsDispatch() {
  return (0, _react.useContext)(DispatchSymbols);
}
var Symbols = exports.Symbols = function Symbols(_ref) {
  var initial = _ref.initial,
    dispatch = _ref.dispatch,
    children = _ref.children;
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(Context.Provider, {
    value: initial,
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(DispatchSymbols.Provider, {
      value: dispatch,
      children: children
    })
  });
};
Symbols.displayName = 'JVR.Symbols';