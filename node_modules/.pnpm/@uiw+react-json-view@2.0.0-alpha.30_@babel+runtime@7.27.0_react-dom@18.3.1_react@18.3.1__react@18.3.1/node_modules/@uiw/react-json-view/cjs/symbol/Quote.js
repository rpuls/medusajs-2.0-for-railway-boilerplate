"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Quote = void 0;
var _Symbols = require("../store/Symbols");
var _useRender = require("../utils/useRender");
var Quote = exports.Quote = function Quote(props) {
  var _useSymbolsStore = (0, _Symbols.useSymbolsStore)(),
    _useSymbolsStore$Quot = _useSymbolsStore.Quote,
    Comp = _useSymbolsStore$Quot === void 0 ? {} : _useSymbolsStore$Quot;
  (0, _useRender.useSymbolsRender)(Comp, props, 'Quote');
  return null;
};
Quote.displayName = 'JVR.Quote';