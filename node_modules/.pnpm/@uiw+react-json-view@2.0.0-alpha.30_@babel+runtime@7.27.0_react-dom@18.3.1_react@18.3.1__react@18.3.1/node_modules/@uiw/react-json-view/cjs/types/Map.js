"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Map = void 0;
var _Types = require("../store/Types");
var _useRender = require("../utils/useRender");
var Map = exports.Map = function Map(props) {
  var _useTypesStore = (0, _Types.useTypesStore)(),
    _useTypesStore$Map = _useTypesStore.Map,
    Comp = _useTypesStore$Map === void 0 ? {} : _useTypesStore$Map;
  (0, _useRender.useTypesRender)(Comp, props, 'Map');
  return null;
};
Map.displayName = 'JVR.Map';