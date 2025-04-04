"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BraceRight = void 0;
var _Symbols = require("../store/Symbols");
var _useRender = require("../utils/useRender");
var BraceRight = exports.BraceRight = function BraceRight(props) {
  var _useSymbolsStore = (0, _Symbols.useSymbolsStore)(),
    _useSymbolsStore$Brac = _useSymbolsStore.BraceRight,
    Comp = _useSymbolsStore$Brac === void 0 ? {} : _useSymbolsStore$Brac;
  (0, _useRender.useSymbolsRender)(Comp, props, 'BraceRight');
  return null;
};
BraceRight.displayName = 'JVR.BraceRight';