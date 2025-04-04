"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Copied = void 0;
var _Section = require("../store/Section");
var _useRender = require("../utils/useRender");
var Copied = exports.Copied = function Copied(props) {
  var _useSectionStore = (0, _Section.useSectionStore)(),
    _useSectionStore$Copi = _useSectionStore.Copied,
    Comp = _useSectionStore$Copi === void 0 ? {} : _useSectionStore$Copi;
  (0, _useRender.useSectionRender)(Comp, props, 'Copied');
  return null;
};
Copied.displayName = 'JVR.Copied';