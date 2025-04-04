"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BraceLeft = void 0;
var _Symbols = require("../store/Symbols");
var _useRender = require("../utils/useRender");
var BraceLeft = exports.BraceLeft = function BraceLeft(props) {
  var _useSymbolsStore = (0, _Symbols.useSymbolsStore)(),
    _useSymbolsStore$Brac = _useSymbolsStore.BraceLeft,
    Comp = _useSymbolsStore$Brac === void 0 ? {} : _useSymbolsStore$Brac;
  (0, _useRender.useSymbolsRender)(Comp, props, 'BraceLeft');
  return null;
};
BraceLeft.displayName = 'JVR.BraceLeft';