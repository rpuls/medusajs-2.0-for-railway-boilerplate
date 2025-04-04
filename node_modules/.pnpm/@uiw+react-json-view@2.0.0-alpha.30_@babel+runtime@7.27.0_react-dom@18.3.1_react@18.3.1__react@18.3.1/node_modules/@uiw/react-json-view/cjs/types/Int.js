"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Int = void 0;
var _Types = require("../store/Types");
var _useRender = require("../utils/useRender");
var Int = exports.Int = function Int(props) {
  var _useTypesStore = (0, _Types.useTypesStore)(),
    _useTypesStore$Int = _useTypesStore.Int,
    Comp = _useTypesStore$Int === void 0 ? {} : _useTypesStore$Int;
  (0, _useRender.useTypesRender)(Comp, props, 'Int');
  return null;
};
Int.displayName = 'JVR.Int';