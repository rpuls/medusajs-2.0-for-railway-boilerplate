"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// packages/react/radix-ui/src/internal.ts
var internal_exports = {};
__export(internal_exports, {
  ArrowPrimitive: () => ArrowPrimitive,
  Collection: () => Collection,
  Context: () => Context,
  DismissableLayer: () => DismissableLayer,
  FocusGuards: () => FocusGuards,
  FocusScope: () => FocusScope,
  Menu: () => Menu,
  Popper: () => Popper,
  Presence: () => Presence,
  Primitive: () => Primitive,
  RovingFocus: () => RovingFocus,
  composeEventHandlers: () => import_primitive.composeEventHandlers,
  composeRefs: () => import_react_compose_refs.composeRefs,
  useCallbackRef: () => import_react_use_callback_ref.useCallbackRef,
  useComposedRefs: () => import_react_compose_refs.useComposedRefs,
  useControllableState: () => import_react_use_controllable_state.useControllableState,
  useEscapeKeydown: () => import_react_use_escape_keydown.useEscapeKeydown,
  useLayoutEffect: () => import_react_use_layout_effect.useLayoutEffect,
  useSize: () => import_react_use_size.useSize
});
module.exports = __toCommonJS(internal_exports);
var import_react_primitive = require("@radix-ui/react-primitive");
var ArrowPrimitive = __toESM(require("@radix-ui/react-arrow"));
var Collection = __toESM(require("@radix-ui/react-collection"));
var import_react_compose_refs = require("@radix-ui/react-compose-refs");
var Context = __toESM(require("@radix-ui/react-context"));
var DismissableLayer = __toESM(require("@radix-ui/react-dismissable-layer"));
var FocusGuards = __toESM(require("@radix-ui/react-focus-guards"));
var FocusScope = __toESM(require("@radix-ui/react-focus-scope"));
var Menu = __toESM(require("@radix-ui/react-menu"));
var Popper = __toESM(require("@radix-ui/react-popper"));
var Presence = __toESM(require("@radix-ui/react-presence"));
var RovingFocus = __toESM(require("@radix-ui/react-roving-focus"));
var import_react_use_callback_ref = require("@radix-ui/react-use-callback-ref");
var import_react_use_controllable_state = require("@radix-ui/react-use-controllable-state");
var import_react_use_escape_keydown = require("@radix-ui/react-use-escape-keydown");
var import_react_use_layout_effect = require("@radix-ui/react-use-layout-effect");
var import_react_use_size = require("@radix-ui/react-use-size");
var import_primitive = require("@radix-ui/primitive");
var Primitive = import_react_primitive.Primitive;
Primitive.dispatchDiscreteCustomEvent = import_react_primitive.dispatchDiscreteCustomEvent;
Primitive.Root = import_react_primitive.Primitive;
//# sourceMappingURL=internal.js.map
