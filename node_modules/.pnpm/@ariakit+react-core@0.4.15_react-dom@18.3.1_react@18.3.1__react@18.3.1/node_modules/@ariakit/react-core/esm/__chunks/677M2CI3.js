"use client";

// src/dialog/utils/supports-inert.ts
function supportsInert() {
  return "inert" in HTMLElement.prototype;
}

export {
  supportsInert
};
