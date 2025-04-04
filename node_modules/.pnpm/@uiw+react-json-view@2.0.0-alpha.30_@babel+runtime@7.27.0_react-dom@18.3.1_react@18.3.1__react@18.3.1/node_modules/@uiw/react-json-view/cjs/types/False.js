"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.False = void 0;
var _Types = require("../store/Types");
var _useRender = require("../utils/useRender");
var False = exports.False = function False(props) {
  var _useTypesStore = (0, _Types.useTypesStore)(),
    _useTypesStore$False = _useTypesStore.False,
    Comp = _useTypesStore$False === void 0 ? {} : _useTypesStore$False;
  (0, _useRender.useTypesRender)(Comp, props, 'False');
  return null;
};
False.displayName = 'JVR.False';