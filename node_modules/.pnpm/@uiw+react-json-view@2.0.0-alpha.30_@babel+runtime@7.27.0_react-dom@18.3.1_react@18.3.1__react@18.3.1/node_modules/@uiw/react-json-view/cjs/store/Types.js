"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault")["default"];
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Types = Types;
exports.useTypes = useTypes;
exports.useTypesDispatch = useTypesDispatch;
exports.useTypesStore = void 0;
var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread2"));
var _react = require("react");
var _jsxRuntime = require("react/jsx-runtime");
var initialState = {
  Str: {
    as: 'span',
    'data-type': 'string',
    style: {
      color: 'var(--w-rjv-type-string-color, #cb4b16)'
    },
    className: 'w-rjv-type',
    children: 'string'
  },
  Url: {
    as: 'a',
    style: {
      color: 'var(--w-rjv-type-url-color, #0969da)'
    },
    'data-type': 'url',
    className: 'w-rjv-type',
    children: 'url'
  },
  Undefined: {
    style: {
      color: 'var(--w-rjv-type-undefined-color, #586e75)'
    },
    as: 'span',
    'data-type': 'undefined',
    className: 'w-rjv-type',
    children: 'undefined'
  },
  Null: {
    style: {
      color: 'var(--w-rjv-type-null-color, #d33682)'
    },
    as: 'span',
    'data-type': 'null',
    className: 'w-rjv-type',
    children: 'null'
  },
  Map: {
    style: {
      color: 'var(--w-rjv-type-map-color, #268bd2)',
      marginRight: 3
    },
    as: 'span',
    'data-type': 'map',
    className: 'w-rjv-type',
    children: 'Map'
  },
  Nan: {
    style: {
      color: 'var(--w-rjv-type-nan-color, #859900)'
    },
    as: 'span',
    'data-type': 'nan',
    className: 'w-rjv-type',
    children: 'NaN'
  },
  Bigint: {
    style: {
      color: 'var(--w-rjv-type-bigint-color, #268bd2)'
    },
    as: 'span',
    'data-type': 'bigint',
    className: 'w-rjv-type',
    children: 'bigint'
  },
  Int: {
    style: {
      color: 'var(--w-rjv-type-int-color, #268bd2)'
    },
    as: 'span',
    'data-type': 'int',
    className: 'w-rjv-type',
    children: 'int'
  },
  Set: {
    style: {
      color: 'var(--w-rjv-type-set-color, #268bd2)',
      marginRight: 3
    },
    as: 'span',
    'data-type': 'set',
    className: 'w-rjv-type',
    children: 'Set'
  },
  Float: {
    style: {
      color: 'var(--w-rjv-type-float-color, #859900)'
    },
    as: 'span',
    'data-type': 'float',
    className: 'w-rjv-type',
    children: 'float'
  },
  True: {
    style: {
      color: 'var(--w-rjv-type-boolean-color, #2aa198)'
    },
    as: 'span',
    'data-type': 'bool',
    className: 'w-rjv-type',
    children: 'bool'
  },
  False: {
    style: {
      color: 'var(--w-rjv-type-boolean-color, #2aa198)'
    },
    as: 'span',
    'data-type': 'bool',
    className: 'w-rjv-type',
    children: 'bool'
  },
  Date: {
    style: {
      color: 'var(--w-rjv-type-date-color, #268bd2)'
    },
    as: 'span',
    'data-type': 'date',
    className: 'w-rjv-type',
    children: 'date'
  }
};
var Context = /*#__PURE__*/(0, _react.createContext)(initialState);
var reducer = function reducer(state, action) {
  return (0, _objectSpread2["default"])((0, _objectSpread2["default"])({}, state), action);
};
var useTypesStore = exports.useTypesStore = function useTypesStore() {
  return (0, _react.useContext)(Context);
};
var DispatchTypes = /*#__PURE__*/(0, _react.createContext)(function () {});
DispatchTypes.displayName = 'JVR.DispatchTypes';
function useTypes() {
  return (0, _react.useReducer)(reducer, initialState);
}
function useTypesDispatch() {
  return (0, _react.useContext)(DispatchTypes);
}
function Types(_ref) {
  var initial = _ref.initial,
    dispatch = _ref.dispatch,
    children = _ref.children;
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(Context.Provider, {
    value: initial,
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(DispatchTypes.Provider, {
      value: dispatch,
      children: children
    })
  });
}
Types.displayName = 'JVR.Types';