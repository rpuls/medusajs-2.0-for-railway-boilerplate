import { Primitive as Primitive$1, dispatchDiscreteCustomEvent } from '@radix-ui/react-primitive';
export { PrimitivePropsWithRef } from '@radix-ui/react-primitive';
import * as reactArrow from '@radix-ui/react-arrow';
export { reactArrow as ArrowPrimitive };
import * as reactCollection from '@radix-ui/react-collection';
export { reactCollection as Collection };
export { composeRefs, useComposedRefs } from '@radix-ui/react-compose-refs';
import * as reactContext from '@radix-ui/react-context';
export { reactContext as Context };
import * as reactDismissableLayer from '@radix-ui/react-dismissable-layer';
export { reactDismissableLayer as DismissableLayer };
import * as reactFocusGuards from '@radix-ui/react-focus-guards';
export { reactFocusGuards as FocusGuards };
import * as reactFocusScope from '@radix-ui/react-focus-scope';
export { reactFocusScope as FocusScope };
import * as reactMenu from '@radix-ui/react-menu';
export { reactMenu as Menu };
import * as reactPopper from '@radix-ui/react-popper';
export { reactPopper as Popper };
import * as reactPresence from '@radix-ui/react-presence';
export { reactPresence as Presence };
import * as reactRovingFocus from '@radix-ui/react-roving-focus';
export { reactRovingFocus as RovingFocus };
export { useCallbackRef } from '@radix-ui/react-use-callback-ref';
export { useControllableState } from '@radix-ui/react-use-controllable-state';
export { useEscapeKeydown } from '@radix-ui/react-use-escape-keydown';
export { useLayoutEffect } from '@radix-ui/react-use-layout-effect';
export { useSize } from '@radix-ui/react-use-size';
export { composeEventHandlers } from '@radix-ui/primitive';

declare const Primitive: typeof Primitive$1 & {
    Root: typeof Primitive$1;
    dispatchDiscreteCustomEvent: typeof dispatchDiscreteCustomEvent;
};

export { Primitive };
