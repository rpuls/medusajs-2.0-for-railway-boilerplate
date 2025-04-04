"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Bigint = void 0;
var _Types = require("../store/Types");
var _useRender = require("../utils/useRender");
var Bigint = exports.Bigint = function Bigint(props) {
  var _useTypesStore = (0, _Types.useTypesStore)(),
    _useTypesStore$Bigint = _useTypesStore.Bigint,
    Comp = _useTypesStore$Bigint === void 0 ? {} : _useTypesStore$Bigint;
  (0, _useRender.useTypesRender)(Comp, props, 'Bigint');
  return null;
};
Bigint.displayName = 'JVR.Bigint';