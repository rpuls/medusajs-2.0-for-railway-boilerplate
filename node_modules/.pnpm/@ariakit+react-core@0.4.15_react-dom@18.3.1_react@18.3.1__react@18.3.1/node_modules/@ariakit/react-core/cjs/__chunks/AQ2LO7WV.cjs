"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/dialog/utils/is-backdrop.ts
function isBackdrop(element, ...ids) {
  if (!element) return false;
  const backdrop = element.getAttribute("data-backdrop");
  if (backdrop == null) return false;
  if (backdrop === "") return true;
  if (backdrop === "true") return true;
  if (!ids.length) return true;
  return ids.some((id) => backdrop === id);
}



exports.isBackdrop = isBackdrop;
