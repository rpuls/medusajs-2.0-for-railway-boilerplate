"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Arrow = void 0;
var _Symbols = require("../store/Symbols");
var _useRender = require("../utils/useRender");
var Arrow = exports.Arrow = function Arrow(props) {
  var _useSymbolsStore = (0, _Symbols.useSymbolsStore)(),
    _useSymbolsStore$Arro = _useSymbolsStore.Arrow,
    Comp = _useSymbolsStore$Arro === void 0 ? {} : _useSymbolsStore$Arro;
  (0, _useRender.useSymbolsRender)(Comp, props, 'Arrow');
  return null;
};
Arrow.displayName = 'JVR.Arrow';