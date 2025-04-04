"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.True = void 0;
var _Types = require("../store/Types");
var _useRender = require("../utils/useRender");
var True = exports.True = function True(props) {
  var _useTypesStore = (0, _Types.useTypesStore)(),
    _useTypesStore$True = _useTypesStore.True,
    Comp = _useTypesStore$True === void 0 ? {} : _useTypesStore$True;
  (0, _useRender.useTypesRender)(Comp, props, 'True');
  return null;
};
True.displayName = 'JVR.True';