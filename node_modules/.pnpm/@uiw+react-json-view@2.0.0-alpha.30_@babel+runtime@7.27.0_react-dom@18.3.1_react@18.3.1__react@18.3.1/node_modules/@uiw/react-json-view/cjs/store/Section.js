"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard")["default"];
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault")["default"];
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Section = void 0;
exports.useSection = useSection;
exports.useSectionDispatch = useSectionDispatch;
exports.useSectionStore = void 0;
var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));
var _react = _interopRequireWildcard(require("react"));
var _jsxRuntime = require("react/jsx-runtime");
var initialState = {
  Copied: {
    className: 'w-rjv-copied',
    style: {
      height: '1em',
      width: '1em',
      cursor: 'pointer',
      verticalAlign: 'middle',
      marginLeft: 5
    }
  },
  CountInfo: {
    as: 'span',
    className: 'w-rjv-object-size',
    style: {
      color: 'var(--w-rjv-info-color, #0000004d)',
      paddingLeft: 8,
      fontStyle: 'italic'
    }
  },
  CountInfoExtra: {
    as: 'span',
    className: 'w-rjv-object-extra',
    style: {
      paddingLeft: 8
    }
  },
  Ellipsis: {
    as: 'span',
    style: {
      cursor: 'pointer',
      color: 'var(--w-rjv-ellipsis-color, #cb4b16)',
      userSelect: 'none'
    },
    className: 'w-rjv-ellipsis',
    children: '...'
  },
  Row: {
    as: 'div',
    className: 'w-rjv-line'
  },
  KeyName: {
    as: 'span',
    className: 'w-rjv-object-key'
  }
};
var Context = /*#__PURE__*/(0, _react.createContext)(initialState);
var reducer = function reducer(state, action) {
  return (0, _objectSpread2["default"])((0, _objectSpread2["default"])({}, state), action);
};
var useSectionStore = exports.useSectionStore = function useSectionStore() {
  return (0, _react.useContext)(Context);
};
var DispatchSection = /*#__PURE__*/(0, _react.createContext)(function () {});
DispatchSection.displayName = 'JVR.DispatchSection';
function useSection() {
  return (0, _react.useReducer)(reducer, initialState);
}
function useSectionDispatch() {
  return (0, _react.useContext)(DispatchSection);
}
var Section = exports.Section = function Section(_ref) {
  var initial = _ref.initial,
    dispatch = _ref.dispatch,
    children = _ref.children;
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(Context.Provider, {
    value: initial,
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(DispatchSection.Provider, {
      value: dispatch,
      children: children
    })
  });
};
Section.displayName = 'JVR.Section';