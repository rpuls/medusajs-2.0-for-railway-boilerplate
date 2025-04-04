var $f49b2d6c91681304$exports = require("./intlStrings.main.js");
var $eO7VF$reactariautils = require("@react-aria/utils");
var $eO7VF$reactariainteractions = require("@react-aria/interactions");
var $eO7VF$react = require("react");
var $eO7VF$reactarialandmark = require("@react-aria/landmark");
var $eO7VF$reactariai18n = require("@react-aria/i18n");


function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}

function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "useToastRegion", () => $eda7c6204a682dd4$export$b8cbbb20a51697de);
/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */ 





function $eda7c6204a682dd4$export$b8cbbb20a51697de(props, state, ref) {
    let stringFormatter = (0, $eO7VF$reactariai18n.useLocalizedStringFormatter)((0, ($parcel$interopDefault($f49b2d6c91681304$exports))), '@react-aria/toast');
    let { landmarkProps: landmarkProps } = (0, $eO7VF$reactarialandmark.useLandmark)({
        role: 'region',
        'aria-label': props['aria-label'] || stringFormatter.format('notifications', {
            count: state.visibleToasts.length
        })
    }, ref);
    let isHovered = (0, $eO7VF$react.useRef)(false);
    let isFocused = (0, $eO7VF$react.useRef)(false);
    let updateTimers = (0, $eO7VF$reactariautils.useEffectEvent)(()=>{
        if (isHovered.current || isFocused.current) state.pauseAll();
        else state.resumeAll();
    });
    let { hoverProps: hoverProps } = (0, $eO7VF$reactariainteractions.useHover)({
        onHoverStart: ()=>{
            isHovered.current = true;
            updateTimers();
        },
        onHoverEnd: ()=>{
            isHovered.current = false;
            updateTimers();
        }
    });
    // Manage focus within the toast region.
    // If a focused containing toast is removed, move focus to the next toast, or the previous toast if there is no next toast.
    let toasts = (0, $eO7VF$react.useRef)([]);
    let prevVisibleToasts = (0, $eO7VF$react.useRef)(state.visibleToasts);
    let focusedToast = (0, $eO7VF$react.useRef)(null);
    (0, $eO7VF$reactariautils.useLayoutEffect)(()=>{
        // If no toast has focus, then don't do anything.
        if (focusedToast.current === -1 || state.visibleToasts.length === 0 || !ref.current) {
            toasts.current = [];
            prevVisibleToasts.current = state.visibleToasts;
            return;
        }
        toasts.current = [
            ...ref.current.querySelectorAll('[role="alertdialog"]')
        ];
        // If the visible toasts haven't changed, we don't need to do anything.
        if (prevVisibleToasts.current.length === state.visibleToasts.length && state.visibleToasts.every((t, i)=>t.key === prevVisibleToasts.current[i].key)) {
            prevVisibleToasts.current = state.visibleToasts;
            return;
        }
        // Get a list of all toasts by index and add info if they are removed.
        let allToasts = prevVisibleToasts.current.map((t, i)=>({
                ...t,
                i: i,
                isRemoved: !state.visibleToasts.some((t2)=>t.key === t2.key)
            }));
        let removedFocusedToastIndex = allToasts.findIndex((t)=>t.i === focusedToast.current && t.isRemoved);
        // If the focused toast was removed, focus the next or previous toast.
        if (removedFocusedToastIndex > -1) {
            var _lastFocused_current;
            // In pointer modality, move focus out of the toast region.
            // Otherwise auto-dismiss timers will appear "stuck".
            if ((0, $eO7VF$reactariainteractions.getInteractionModality)() === 'pointer' && ((_lastFocused_current = lastFocused.current) === null || _lastFocused_current === void 0 ? void 0 : _lastFocused_current.isConnected)) (0, $eO7VF$reactariautils.focusWithoutScrolling)(lastFocused.current);
            else {
                let i = 0;
                let nextToast;
                let prevToast;
                while(i <= removedFocusedToastIndex){
                    if (!allToasts[i].isRemoved) prevToast = Math.max(0, i - 1);
                    i++;
                }
                while(i < allToasts.length){
                    if (!allToasts[i].isRemoved) {
                        nextToast = i - 1;
                        break;
                    }
                    i++;
                }
                // in the case where it's one toast at a time, both will be undefined, but we know the index must be 0
                if (prevToast === undefined && nextToast === undefined) prevToast = 0;
                // prioritize going to newer toasts
                if (prevToast >= 0 && prevToast < toasts.current.length) (0, $eO7VF$reactariautils.focusWithoutScrolling)(toasts.current[prevToast]);
                else if (nextToast >= 0 && nextToast < toasts.current.length) (0, $eO7VF$reactariautils.focusWithoutScrolling)(toasts.current[nextToast]);
            }
        }
        prevVisibleToasts.current = state.visibleToasts;
    }, [
        state.visibleToasts,
        ref,
        updateTimers
    ]);
    let lastFocused = (0, $eO7VF$react.useRef)(null);
    let { focusWithinProps: focusWithinProps } = (0, $eO7VF$reactariainteractions.useFocusWithin)({
        onFocusWithin: (e)=>{
            isFocused.current = true;
            lastFocused.current = e.relatedTarget;
            updateTimers();
        },
        onBlurWithin: ()=>{
            isFocused.current = false;
            lastFocused.current = null;
            updateTimers();
        }
    });
    // When the number of visible toasts becomes 0 or the region unmounts,
    // restore focus to the last element that had focus before the user moved focus
    // into the region. FocusScope restore focus doesn't update whenever the focus
    // moves in, it only happens once, so we correct it.
    // Because we're in a hook, we can't control if the user unmounts or not.
    (0, $eO7VF$react.useEffect)(()=>{
        var _lastFocused_current;
        if (state.visibleToasts.length === 0 && ((_lastFocused_current = lastFocused.current) === null || _lastFocused_current === void 0 ? void 0 : _lastFocused_current.isConnected)) {
            if ((0, $eO7VF$reactariainteractions.getInteractionModality)() === 'pointer') (0, $eO7VF$reactariautils.focusWithoutScrolling)(lastFocused.current);
            else lastFocused.current.focus();
            lastFocused.current = null;
        }
    }, [
        ref,
        state.visibleToasts.length
    ]);
    (0, $eO7VF$react.useEffect)(()=>{
        return ()=>{
            var _lastFocused_current;
            if ((_lastFocused_current = lastFocused.current) === null || _lastFocused_current === void 0 ? void 0 : _lastFocused_current.isConnected) {
                if ((0, $eO7VF$reactariainteractions.getInteractionModality)() === 'pointer') (0, $eO7VF$reactariautils.focusWithoutScrolling)(lastFocused.current);
                else lastFocused.current.focus();
                lastFocused.current = null;
            }
        };
    }, [
        ref
    ]);
    return {
        regionProps: (0, $eO7VF$reactariautils.mergeProps)(landmarkProps, hoverProps, focusWithinProps, {
            tabIndex: -1,
            // Mark the toast region as a "top layer", so that it:
            //   - is not aria-hidden when opening an overlay
            //   - allows focus even outside a containing focus scope
            //   - doesn’t dismiss overlays when clicking on it, even though it is outside
            // @ts-ignore
            'data-react-aria-top-layer': true,
            // listen to focus events separate from focuswithin because that will only fire once
            // and we need to follow all focus changes
            onFocus: (e)=>{
                let target = e.target.closest('[role="alertdialog"]');
                focusedToast.current = toasts.current.findIndex((t)=>t === target);
            },
            onBlur: ()=>{
                focusedToast.current = -1;
            }
        })
    };
}


//# sourceMappingURL=useToastRegion.main.js.map
