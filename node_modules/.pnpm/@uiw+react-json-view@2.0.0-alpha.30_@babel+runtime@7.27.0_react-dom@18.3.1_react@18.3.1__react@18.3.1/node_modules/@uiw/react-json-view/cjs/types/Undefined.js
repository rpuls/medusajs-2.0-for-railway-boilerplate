"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Undefined = void 0;
var _Types = require("../store/Types");
var _useRender = require("../utils/useRender");
var Undefined = exports.Undefined = function Undefined(props) {
  var _useTypesStore = (0, _Types.useTypesStore)(),
    _useTypesStore$Undefi = _useTypesStore.Undefined,
    Comp = _useTypesStore$Undefi === void 0 ? {} : _useTypesStore$Undefi;
  (0, _useRender.useTypesRender)(Comp, props, 'Undefined');
  return null;
};
Undefined.displayName = 'JVR.Undefined';