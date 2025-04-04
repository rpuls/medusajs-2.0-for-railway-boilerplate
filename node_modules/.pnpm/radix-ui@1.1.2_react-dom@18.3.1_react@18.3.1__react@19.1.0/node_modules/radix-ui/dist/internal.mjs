// packages/react/radix-ui/src/internal.ts
import { Primitive as BasePrimitive, dispatchDiscreteCustomEvent } from "@radix-ui/react-primitive";
import * as ArrowPrimitive from "@radix-ui/react-arrow";
import * as Collection from "@radix-ui/react-collection";
import { composeRefs, useComposedRefs } from "@radix-ui/react-compose-refs";
import * as Context from "@radix-ui/react-context";
import * as DismissableLayer from "@radix-ui/react-dismissable-layer";
import * as FocusGuards from "@radix-ui/react-focus-guards";
import * as FocusScope from "@radix-ui/react-focus-scope";
import * as Menu from "@radix-ui/react-menu";
import * as Popper from "@radix-ui/react-popper";
import * as Presence from "@radix-ui/react-presence";
import * as RovingFocus from "@radix-ui/react-roving-focus";
import { useCallbackRef } from "@radix-ui/react-use-callback-ref";
import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { useEscapeKeydown } from "@radix-ui/react-use-escape-keydown";
import { useLayoutEffect } from "@radix-ui/react-use-layout-effect";
import { useSize } from "@radix-ui/react-use-size";
import { composeEventHandlers } from "@radix-ui/primitive";
var Primitive = BasePrimitive;
Primitive.dispatchDiscreteCustomEvent = dispatchDiscreteCustomEvent;
Primitive.Root = BasePrimitive;
export {
  ArrowPrimitive,
  Collection,
  Context,
  DismissableLayer,
  FocusGuards,
  FocusScope,
  Menu,
  Popper,
  Presence,
  Primitive,
  RovingFocus,
  composeEventHandlers,
  composeRefs,
  useCallbackRef,
  useComposedRefs,
  useControllableState,
  useEscapeKeydown,
  useLayoutEffect,
  useSize
};
//# sourceMappingURL=internal.mjs.map
