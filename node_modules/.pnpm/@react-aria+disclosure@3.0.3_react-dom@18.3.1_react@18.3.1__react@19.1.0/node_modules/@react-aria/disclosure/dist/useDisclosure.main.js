var $l3cx6$reactdom = require("react-dom");
var $l3cx6$react = require("react");
var $l3cx6$reactariautils = require("@react-aria/utils");
var $l3cx6$reactariassr = require("@react-aria/ssr");


function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "useDisclosure", () => $ef53cd1bcef2de68$export$6e3e27031a30522f);
/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */ 



function $ef53cd1bcef2de68$export$6e3e27031a30522f(props, state, ref) {
    let { isDisabled: isDisabled } = props;
    let triggerId = (0, $l3cx6$reactariautils.useId)();
    let panelId = (0, $l3cx6$reactariautils.useId)();
    let isSSR = (0, $l3cx6$reactariassr.useIsSSR)();
    let supportsBeforeMatch = !isSSR && 'onbeforematch' in document.body;
    let raf = (0, $l3cx6$react.useRef)(null);
    let handleBeforeMatch = (0, $l3cx6$react.useCallback)(()=>{
        // Wait a frame to revert browser's removal of hidden attribute
        raf.current = requestAnimationFrame(()=>{
            if (ref.current) ref.current.setAttribute('hidden', 'until-found');
        });
        // Force sync state update
        (0, $l3cx6$reactdom.flushSync)(()=>{
            state.toggle();
        });
    }, [
        ref,
        state
    ]);
    // @ts-ignore https://github.com/facebook/react/pull/24741
    (0, $l3cx6$reactariautils.useEvent)(ref, 'beforematch', supportsBeforeMatch ? handleBeforeMatch : null);
    (0, $l3cx6$reactariautils.useLayoutEffect)(()=>{
        // Cancel any pending RAF to prevent stale updates
        if (raf.current) cancelAnimationFrame(raf.current);
        // Until React supports hidden="until-found": https://github.com/facebook/react/pull/24741
        if (supportsBeforeMatch && ref.current && !isDisabled) {
            if (state.isExpanded) ref.current.removeAttribute('hidden');
            else ref.current.setAttribute('hidden', 'until-found');
        }
    }, [
        isDisabled,
        ref,
        state.isExpanded,
        supportsBeforeMatch
    ]);
    (0, $l3cx6$react.useEffect)(()=>{
        return ()=>{
            if (raf.current) cancelAnimationFrame(raf.current);
        };
    }, []);
    return {
        buttonProps: {
            id: triggerId,
            'aria-expanded': state.isExpanded,
            'aria-controls': panelId,
            onPress: (e)=>{
                if (!isDisabled && e.pointerType !== 'keyboard') state.toggle();
            },
            isDisabled: isDisabled,
            onPressStart (e) {
                if (e.pointerType === 'keyboard' && !isDisabled) state.toggle();
            }
        },
        panelProps: {
            id: panelId,
            // This can be overridden at the panel element level.
            role: 'group',
            'aria-labelledby': triggerId,
            'aria-hidden': !state.isExpanded,
            hidden: supportsBeforeMatch ? true : !state.isExpanded
        }
    };
}


//# sourceMappingURL=useDisclosure.main.js.map
