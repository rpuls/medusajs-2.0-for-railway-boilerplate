"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Nan = void 0;
var _Types = require("../store/Types");
var _useRender = require("../utils/useRender");
var Nan = exports.Nan = function Nan(props) {
  var _useTypesStore = (0, _Types.useTypesStore)(),
    _useTypesStore$Nan = _useTypesStore.Nan,
    Comp = _useTypesStore$Nan === void 0 ? {} : _useTypesStore$Nan;
  (0, _useRender.useTypesRender)(Comp, props, 'Nan');
  return null;
};
Nan.displayName = 'JVR.Nan';