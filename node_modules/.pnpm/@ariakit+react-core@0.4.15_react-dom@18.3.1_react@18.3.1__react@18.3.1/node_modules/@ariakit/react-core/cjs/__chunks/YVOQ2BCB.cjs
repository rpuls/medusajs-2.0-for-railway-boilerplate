"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _4SKDRUBRcjs = require('./4SKDRUBR.cjs');

// src/dialog/utils/walk-tree-outside.ts
var _dom = require('@ariakit/core/utils/dom');
var _misc = require('@ariakit/core/utils/misc');
var ignoreTags = ["SCRIPT", "STYLE"];
function getSnapshotPropertyName(id) {
  return `__ariakit-dialog-snapshot-${id}`;
}
function inSnapshot(id, element) {
  const doc = _dom.getDocument.call(void 0, element);
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
    (enabledElement) => enabledElement && _dom.contains.call(void 0, element, enabledElement)
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
    const doc = _dom.getDocument.call(void 0, element);
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
  const { body } = _dom.getDocument.call(void 0, elements[0]);
  const cleanups = [];
  const markElement = (element) => {
    cleanups.push(_4SKDRUBRcjs.setProperty.call(void 0, element, getSnapshotPropertyName(id), true));
  };
  walkTreeOutside(id, elements, markElement);
  return _misc.chain.call(void 0, _4SKDRUBRcjs.setProperty.call(void 0, body, getSnapshotPropertyName(id), true), () => {
    for (const cleanup of cleanups) {
      cleanup();
    }
  });
}





exports.isValidElement = isValidElement; exports.walkTreeOutside = walkTreeOutside; exports.createWalkTreeSnapshot = createWalkTreeSnapshot;
