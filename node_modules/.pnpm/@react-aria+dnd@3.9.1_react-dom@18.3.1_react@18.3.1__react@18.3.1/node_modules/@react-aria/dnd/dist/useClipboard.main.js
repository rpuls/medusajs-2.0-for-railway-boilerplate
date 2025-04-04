var $4620ae0dc40f0031$exports = require("./utils.main.js");
var $gAFdr$reactariautils = require("@react-aria/utils");
var $gAFdr$react = require("react");
var $gAFdr$reactariainteractions = require("@react-aria/interactions");


function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "useClipboard", () => $74f3dedaa4d234b4$export$2314ca2a3e892862);
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



const $74f3dedaa4d234b4$var$globalEvents = new Map();
function $74f3dedaa4d234b4$var$addGlobalEventListener(event, fn) {
    let eventData = $74f3dedaa4d234b4$var$globalEvents.get(event);
    if (!eventData) {
        let handlers = new Set();
        let listener = (e)=>{
            for (let handler of handlers)handler(e);
        };
        eventData = {
            listener: listener,
            handlers: handlers
        };
        $74f3dedaa4d234b4$var$globalEvents.set(event, eventData);
        document.addEventListener(event, listener);
    }
    eventData.handlers.add(fn);
    return ()=>{
        eventData.handlers.delete(fn);
        if (eventData.handlers.size === 0) {
            document.removeEventListener(event, eventData.listener);
            $74f3dedaa4d234b4$var$globalEvents.delete(event);
        }
    };
}
function $74f3dedaa4d234b4$export$2314ca2a3e892862(options) {
    let { isDisabled: isDisabled } = options;
    let isFocusedRef = (0, $gAFdr$react.useRef)(false);
    let { focusProps: focusProps } = (0, $gAFdr$reactariainteractions.useFocus)({
        onFocusChange: (isFocused)=>{
            isFocusedRef.current = isFocused;
        }
    });
    let onBeforeCopy = (0, $gAFdr$reactariautils.useEffectEvent)((e)=>{
        // Enable the "Copy" menu item in Safari if this element is focused and copying is supported.
        if (isFocusedRef.current && options.getItems) e.preventDefault();
    });
    let onCopy = (0, $gAFdr$reactariautils.useEffectEvent)((e)=>{
        if (!isFocusedRef.current || !options.getItems) return;
        e.preventDefault();
        if (e.clipboardData) {
            var _options_onCopy;
            (0, $4620ae0dc40f0031$exports.writeToDataTransfer)(e.clipboardData, options.getItems({
                action: 'copy'
            }));
            (_options_onCopy = options.onCopy) === null || _options_onCopy === void 0 ? void 0 : _options_onCopy.call(options);
        }
    });
    let onBeforeCut = (0, $gAFdr$reactariautils.useEffectEvent)((e)=>{
        if (isFocusedRef.current && options.onCut && options.getItems) e.preventDefault();
    });
    let onCut = (0, $gAFdr$reactariautils.useEffectEvent)((e)=>{
        if (!isFocusedRef.current || !options.onCut || !options.getItems) return;
        e.preventDefault();
        if (e.clipboardData) {
            (0, $4620ae0dc40f0031$exports.writeToDataTransfer)(e.clipboardData, options.getItems({
                action: 'cut'
            }));
            options.onCut();
        }
    });
    let onBeforePaste = (0, $gAFdr$reactariautils.useEffectEvent)((e)=>{
        // Unfortunately, e.clipboardData.types is not available in this event so we always
        // have to enable the Paste menu item even if the type of data is unsupported.
        if (isFocusedRef.current && options.onPaste) e.preventDefault();
    });
    let onPaste = (0, $gAFdr$reactariautils.useEffectEvent)((e)=>{
        if (!isFocusedRef.current || !options.onPaste) return;
        e.preventDefault();
        if (e.clipboardData) {
            let items = (0, $4620ae0dc40f0031$exports.readFromDataTransfer)(e.clipboardData);
            options.onPaste(items);
        }
    });
    (0, $gAFdr$react.useEffect)(()=>{
        if (isDisabled) return;
        return (0, $gAFdr$reactariautils.chain)($74f3dedaa4d234b4$var$addGlobalEventListener('beforecopy', onBeforeCopy), $74f3dedaa4d234b4$var$addGlobalEventListener('copy', onCopy), $74f3dedaa4d234b4$var$addGlobalEventListener('beforecut', onBeforeCut), $74f3dedaa4d234b4$var$addGlobalEventListener('cut', onCut), $74f3dedaa4d234b4$var$addGlobalEventListener('beforepaste', onBeforePaste), $74f3dedaa4d234b4$var$addGlobalEventListener('paste', onPaste));
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


//# sourceMappingURL=useClipboard.main.js.map
