"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Null = void 0;
var _Types = require("../store/Types");
var _useRender = require("../utils/useRender");
var Null = exports.Null = function Null(props) {
  var _useTypesStore = (0, _Types.useTypesStore)(),
    _useTypesStore$Null = _useTypesStore.Null,
    Comp = _useTypesStore$Null === void 0 ? {} : _useTypesStore$Null;
  (0, _useRender.useTypesRender)(Comp, props, 'Null');
  return null;
};
Null.displayName = 'JVR.Null';