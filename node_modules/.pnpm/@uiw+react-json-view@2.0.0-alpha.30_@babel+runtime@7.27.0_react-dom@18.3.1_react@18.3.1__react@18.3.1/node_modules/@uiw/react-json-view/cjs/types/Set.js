"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Set = void 0;
var _Types = require("../store/Types");
var _useRender = require("../utils/useRender");
var Set = exports.Set = function Set(props) {
  var _useTypesStore = (0, _Types.useTypesStore)(),
    _useTypesStore$Set = _useTypesStore.Set,
    Comp = _useTypesStore$Set === void 0 ? {} : _useTypesStore$Set;
  (0, _useRender.useTypesRender)(Comp, props, 'Set');
  return null;
};
Set.displayName = 'JVR.Set';