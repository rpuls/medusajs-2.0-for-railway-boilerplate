"use client";
import {
  setProperty
} from "./K2ZF5NU7.js";

// src/dialog/utils/walk-tree-outside.ts
import { contains, getDocument } from "@ariakit/core/utils/dom";
import { chain } from "@ariakit/core/utils/misc";
var ignoreTags = ["SCRIPT", "STYLE"];
function getSnapshotPropertyName(id) {
  return `__ariakit-dialog-snapshot-${id}`;
}
function inSnapshot(id, element) {
  const doc = getDocument(element);
  const propertyName = getSnapshotPropertyName(id);
  if (!doc.body[propertyName]) return true;
  do {
    if (element === doc.body) return false;
    if (element[propertyName]) return true;
    if (!element.parentElement) return false;
    element = element.parentElement;
  } while (true);
}
function isValidElement(id, element, ignoredElements) {
  if (ignoreTags.includes(element.tagName)) return false;
  if (!inSnapshot(id, element)) return false;
  return !ignoredElements.some(
    (enabledElement) => enabledElement && contains(element, enabledElement)
  );
}
function walkTreeOutside(id, elements, callback, ancestorCallback) {
  for (let element of elements) {
    if (!(element == null ? void 0 : element.isConnected)) continue;
    const hasAncestorAlready = elements.some((maybeAncestor) => {
      if (!maybeAncestor) return false;
      if (maybeAncestor === element) return false;
      return maybeAncestor.contains(element);
    });
    const doc = getDocument(element);
    const originalElement = element;
    while (element.parentElement && element !== doc.body) {
      ancestorCallback == null ? void 0 : ancestorCallback(element.parentElement, originalElement);
      if (!hasAncestorAlready) {
        for (const child of element.parentElement.children) {
          if (isValidElement(id, child, elements)) {
            callback(child, originalElement);
          }
        }
      }
      element = element.parentElement;
    }
  }
}
function createWalkTreeSnapshot(id, elements) {
  const { body } = getDocument(elements[0]);
  const cleanups = [];
  const markElement = (element) => {
    cleanups.push(setProperty(element, getSnapshotPropertyName(id), true));
  };
  walkTreeOutside(id, elements, markElement);
  return chain(setProperty(body, getSnapshotPropertyName(id), true), () => {
    for (const cleanup of cleanups) {
      cleanup();
    }
  });
}

export {
  isValidElement,
  walkTreeOutside,
  createWalkTreeSnapshot
};
