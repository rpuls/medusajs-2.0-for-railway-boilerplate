"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BracketsLeft = void 0;
var _Symbols = require("../store/Symbols");
var _useRender = require("../utils/useRender");
var BracketsLeft = exports.BracketsLeft = function BracketsLeft(props) {
  var _useSymbolsStore = (0, _Symbols.useSymbolsStore)(),
    _useSymbolsStore$Brac = _useSymbolsStore.BracketsLeft,
    Comp = _useSymbolsStore$Brac === void 0 ? {} : _useSymbolsStore$Brac;
  (0, _useRender.useSymbolsRender)(Comp, props, 'BracketsLeft');
  return null;
};
BracketsLeft.displayName = 'JVR.BracketsLeft';