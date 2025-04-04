"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/dialog/utils/prepend-hidden-dismiss.ts
var _dom = require('@ariakit/core/utils/dom');
function prependHiddenDismiss(container, onClick) {
  const document = _dom.getDocument.call(void 0, container);
  const button = document.createElement("button");
  button.type = "button";
  button.tabIndex = -1;
  button.textContent = "Dismiss popup";
  Object.assign(button.style, {
    border: "0px",
    clip: "rect(0 0 0 0)",
    height: "1px",
    margin: "-1px",
    overflow: "hidden",
    padding: "0px",
    position: "absolute",
    whiteSpace: "nowrap",
    width: "1px"
  });
  button.addEventListener("click", onClick);
  container.prepend(button);
  const removeHiddenDismiss = () => {
    button.removeEventListener("click", onClick);
    button.remove();
  };
  return removeHiddenDismiss;
}



exports.prependHiddenDismiss = prependHiddenDismiss;
