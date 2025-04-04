"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StringText = void 0;
var _Types = require("../store/Types");
var _useRender = require("../utils/useRender");
var StringText = exports.StringText = function StringText(props) {
  var _useTypesStore = (0, _Types.useTypesStore)(),
    _useTypesStore$Str = _useTypesStore.Str,
    Comp = _useTypesStore$Str === void 0 ? {} : _useTypesStore$Str;
  (0, _useRender.useTypesRender)(Comp, props, 'Str');
  return null;
};
StringText.displayName = 'JVR.StringText';