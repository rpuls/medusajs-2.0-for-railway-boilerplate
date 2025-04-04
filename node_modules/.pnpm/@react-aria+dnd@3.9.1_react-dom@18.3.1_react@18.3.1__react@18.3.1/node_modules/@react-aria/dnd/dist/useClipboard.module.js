import {readFromDataTransfer as $7252cd45fc48c07c$export$d9e760437831f8b3, writeToDataTransfer as $7252cd45fc48c07c$export$f9c1490890ddd063} from "./utils.module.js";
import {useEffectEvent as $9Tt78$useEffectEvent, chain as $9Tt78$chain} from "@react-aria/utils";
import {useRef as $9Tt78$useRef, useEffect as $9Tt78$useEffect} from "react";
import {useFocus as $9Tt78$useFocus} from "@react-aria/interactions";

/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */ 



const $9fcc7f0d70d084ee$var$globalEvents = new Map();
function $9fcc7f0d70d084ee$var$addGlobalEventListener(event, fn) {
    let eventData = $9fcc7f0d70d084ee$var$globalEvents.get(event);
    if (!eventData) {
        let handlers = new Set();
        let listener = (e)=>{
            for (let handler of handlers)handler(e);
        };
        eventData = {
            listener: listener,
            handlers: handlers
        };
        $9fcc7f0d70d084ee$var$globalEvents.set(event, eventData);
        document.addEventListener(event, listener);
    }
    eventData.handlers.add(fn);
    return ()=>{
        eventData.handlers.delete(fn);
        if (eventData.handlers.size === 0) {
            document.removeEventListener(event, eventData.listener);
            $9fcc7f0d70d084ee$var$globalEvents.delete(event);
        }
    };
}
function $9fcc7f0d70d084ee$export$2314ca2a3e892862(options) {
    let { isDisabled: isDisabled } = options;
    let isFocusedRef = (0, $9Tt78$useRef)(false);
    let { focusProps: focusProps } = (0, $9Tt78$useFocus)({
        onFocusChange: (isFocused)=>{
            isFocusedRef.current = isFocused;
        }
    });
    let onBeforeCopy = (0, $9Tt78$useEffectEvent)((e)=>{
        // Enable the "Copy" menu item in Safari if this element is focused and copying is supported.
        if (isFocusedRef.current && options.getItems) e.preventDefault();
    });
    let onCopy = (0, $9Tt78$useEffectEvent)((e)=>{
        if (!isFocusedRef.current || !options.getItems) return;
        e.preventDefault();
        if (e.clipboardData) {
            var _options_onCopy;
            (0, $7252cd45fc48c07c$export$f9c1490890ddd063)(e.clipboardData, options.getItems({
                action: 'copy'
            }));
            (_options_onCopy = options.onCopy) === null || _options_onCopy === void 0 ? void 0 : _options_onCopy.call(options);
        }
    });
    let onBeforeCut = (0, $9Tt78$useEffectEvent)((e)=>{
        if (isFocusedRef.current && options.onCut && options.getItems) e.preventDefault();
    });
    let onCut = (0, $9Tt78$useEffectEvent)((e)=>{
        if (!isFocusedRef.current || !options.onCut || !options.getItems) return;
        e.preventDefault();
        if (e.clipboardData) {
            (0, $7252cd45fc48c07c$export$f9c1490890ddd063)(e.clipboardData, options.getItems({
                action: 'cut'
            }));
            options.onCut();
        }
    });
    let onBeforePaste = (0, $9Tt78$useEffectEvent)((e)=>{
        // Unfortunately, e.clipboardData.types is not available in this event so we always
        // have to enable the Paste menu item even if the type of data is unsupported.
        if (isFocusedRef.current && options.onPaste) e.preventDefault();
    });
    let onPaste = (0, $9Tt78$useEffectEvent)((e)=>{
        if (!isFocusedRef.current || !options.onPaste) return;
        e.preventDefault();
        if (e.clipboardData) {
            let items = (0, $7252cd45fc48c07c$export$d9e760437831f8b3)(e.clipboardData);
            options.onPaste(items);
        }
    });
    (0, $9Tt78$useEffect)(()=>{
        if (isDisabled) return;
        return (0, $9Tt78$chain)($9fcc7f0d70d084ee$var$addGlobalEventListener('beforecopy', onBeforeCopy), $9fcc7f0d70d084ee$var$addGlobalEventListener('copy', onCopy), $9fcc7f0d70d084ee$var$addGlobalEventListener('beforecut', onBeforeCut), $9fcc7f0d70d084ee$var$addGlobalEventListener('cut', onCut), $9fcc7f0d70d084ee$var$addGlobalEventListener('beforepaste', onBeforePaste), $9fcc7f0d70d084ee$var$addGlobalEventListener('paste', onPaste));
    }, [
        isDisabled,
        onBeforeCopy,
        onCopy,
        onBeforeCut,
        onCut,
        onBeforePaste,
        onPaste
    ]);
    return {
        clipboardProps: focusProps
    };
}


export {$9fcc7f0d70d084ee$export$2314ca2a3e892862 as useClipboard};
//# sourceMappingURL=useClipboard.module.js.map
