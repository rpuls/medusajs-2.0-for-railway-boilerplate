"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Float = void 0;
var _Types = require("../store/Types");
var _useRender = require("../utils/useRender");
var Float = exports.Float = function Float(props) {
  var _useTypesStore = (0, _Types.useTypesStore)(),
    _useTypesStore$Float = _useTypesStore.Float,
    Comp = _useTypesStore$Float === void 0 ? {} : _useTypesStore$Float;
  (0, _useRender.useTypesRender)(Comp, props, 'Float');
  return null;
};
Float.displayName = 'JVR.Float';