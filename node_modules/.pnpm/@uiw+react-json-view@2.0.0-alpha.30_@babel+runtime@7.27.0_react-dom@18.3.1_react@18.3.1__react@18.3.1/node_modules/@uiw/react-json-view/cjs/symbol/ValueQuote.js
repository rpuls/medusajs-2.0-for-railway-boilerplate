"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ValueQuote = void 0;
var _Symbols = require("../store/Symbols");
var _useRender = require("../utils/useRender");
var ValueQuote = exports.ValueQuote = function ValueQuote(props) {
  var _useSymbolsStore = (0, _Symbols.useSymbolsStore)(),
    _useSymbolsStore$Valu = _useSymbolsStore.ValueQuote,
    Comp = _useSymbolsStore$Valu === void 0 ? {} : _useSymbolsStore$Valu;
  (0, _useRender.useSymbolsRender)(Comp, props, 'ValueQuote');
  return null;
};
ValueQuote.displayName = 'JVR.ValueQuote';