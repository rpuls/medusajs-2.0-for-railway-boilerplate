"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Colon = void 0;
var _Symbols = require("../store/Symbols");
var _useRender = require("../utils/useRender");
var Colon = exports.Colon = function Colon(props) {
  var _useSymbolsStore = (0, _Symbols.useSymbolsStore)(),
    _useSymbolsStore$Colo = _useSymbolsStore.Colon,
    Comp = _useSymbolsStore$Colo === void 0 ? {} : _useSymbolsStore$Colo;
  (0, _useRender.useSymbolsRender)(Comp, props, 'Colon');
  return null;
};
Colon.displayName = 'JVR.Colon';