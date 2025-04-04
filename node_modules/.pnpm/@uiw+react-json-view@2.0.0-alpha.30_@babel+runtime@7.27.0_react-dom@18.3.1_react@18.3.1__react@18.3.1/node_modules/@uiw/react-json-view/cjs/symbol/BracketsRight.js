"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BracketsRight = void 0;
var _Symbols = require("../store/Symbols");
var _useRender = require("../utils/useRender");
var BracketsRight = exports.BracketsRight = function BracketsRight(props) {
  var _useSymbolsStore = (0, _Symbols.useSymbolsStore)(),
    _useSymbolsStore$Brac = _useSymbolsStore.BracketsRight,
    Comp = _useSymbolsStore$Brac === void 0 ? {} : _useSymbolsStore$Brac;
  (0, _useRender.useSymbolsRender)(Comp, props, 'BracketsRight');
  return null;
};
BracketsRight.displayName = 'JVR.BracketsRight';