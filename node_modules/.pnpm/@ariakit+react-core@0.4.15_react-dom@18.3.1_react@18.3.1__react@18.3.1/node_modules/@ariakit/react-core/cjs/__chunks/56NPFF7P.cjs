"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/dialog/utils/supports-inert.ts
function supportsInert() {
  return "inert" in HTMLElement.prototype;
}



exports.supportsInert = supportsInert;
