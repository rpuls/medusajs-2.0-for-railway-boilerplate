import {flushSync as $6wN6e$flushSync} from "react-dom";
import {useRef as $6wN6e$useRef, useCallback as $6wN6e$useCallback, useEffect as $6wN6e$useEffect} from "react";
import {useId as $6wN6e$useId, useEvent as $6wN6e$useEvent, useLayoutEffect as $6wN6e$useLayoutEffect} from "@react-aria/utils";
import {useIsSSR as $6wN6e$useIsSSR} from "@react-aria/ssr";

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



function $5e910fae8e128ead$export$6e3e27031a30522f(props, state, ref) {
    let { isDisabled: isDisabled } = props;
    let triggerId = (0, $6wN6e$useId)();
    let panelId = (0, $6wN6e$useId)();
    let isSSR = (0, $6wN6e$useIsSSR)();
    let supportsBeforeMatch = !isSSR && 'onbeforematch' in document.body;
    let raf = (0, $6wN6e$useRef)(null);
    let handleBeforeMatch = (0, $6wN6e$useCallback)(()=>{
        // Wait a frame to revert browser's removal of hidden attribute
        raf.current = requestAnimationFrame(()=>{
            if (ref.current) ref.current.setAttribute('hidden', 'until-found');
        });
        // Force sync state update
        (0, $6wN6e$flushSync)(()=>{
            state.toggle();
        });
    }, [
        ref,
        state
    ]);
    // @ts-ignore https://github.com/facebook/react/pull/24741
    (0, $6wN6e$useEvent)(ref, 'beforematch', supportsBeforeMatch ? handleBeforeMatch : null);
    (0, $6wN6e$useLayoutEffect)(()=>{
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
    (0, $6wN6e$useEffect)(()=>{
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


export {$5e910fae8e128ead$export$6e3e27031a30522f as useDisclosure};
//# sourceMappingURL=useDisclosure.module.js.map
