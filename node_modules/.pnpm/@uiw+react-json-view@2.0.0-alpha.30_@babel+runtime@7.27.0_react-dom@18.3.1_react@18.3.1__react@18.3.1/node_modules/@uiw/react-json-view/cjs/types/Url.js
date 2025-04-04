"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Url = void 0;
var _Types = require("../store/Types");
var _useRender = require("../utils/useRender");
var Url = exports.Url = function Url(props) {
  var _useTypesStore = (0, _Types.useTypesStore)(),
    _useTypesStore$Url = _useTypesStore.Url,
    Comp = _useTypesStore$Url === void 0 ? {} : _useTypesStore$Url;
  (0, _useRender.useTypesRender)(Comp, props, 'Url');
  return null;
};
Url.displayName = 'JVR.Url';