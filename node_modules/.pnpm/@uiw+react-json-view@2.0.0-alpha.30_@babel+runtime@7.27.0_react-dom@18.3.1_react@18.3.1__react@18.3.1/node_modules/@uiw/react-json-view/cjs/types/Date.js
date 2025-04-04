"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Date = void 0;
var _Types = require("../store/Types");
var _useRender = require("../utils/useRender");
var Date = exports.Date = function Date(props) {
  var _useTypesStore = (0, _Types.useTypesStore)(),
    _useTypesStore$Date = _useTypesStore.Date,
    Comp = _useTypesStore$Date === void 0 ? {} : _useTypesStore$Date;
  (0, _useRender.useTypesRender)(Comp, props, 'Date');
  return null;
};
Date.displayName = 'JVR.Date';