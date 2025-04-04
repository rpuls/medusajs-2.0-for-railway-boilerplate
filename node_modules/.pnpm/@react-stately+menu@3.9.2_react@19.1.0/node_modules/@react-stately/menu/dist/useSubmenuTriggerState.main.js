var $9cbje$react = require("react");


function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "useSubmenuTriggerState", () => $38ab7fb105c54ad2$export$cfc51cf86138bf98);
/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */ 
function $38ab7fb105c54ad2$export$cfc51cf86138bf98(props, state) {
    let { triggerKey: triggerKey } = props;
    let { expandedKeysStack: expandedKeysStack, openSubmenu: openSubmenu, closeSubmenu: closeSubmenu, close: closeAll } = state;
    let [submenuLevel] = (0, $9cbje$react.useState)(expandedKeysStack === null || expandedKeysStack === void 0 ? void 0 : expandedKeysStack.length);
    let isOpen = (0, $9cbje$react.useMemo)(()=>expandedKeysStack[submenuLevel] === triggerKey, [
        expandedKeysStack,
        triggerKey,
        submenuLevel
    ]);
    let [focusStrategy, setFocusStrategy] = (0, $9cbje$react.useState)(null);
    let open = (0, $9cbje$react.useCallback)((focusStrategy)=>{
        setFocusStrategy(focusStrategy !== null && focusStrategy !== void 0 ? focusStrategy : null);
        openSubmenu(triggerKey, submenuLevel);
    }, [
        openSubmenu,
        submenuLevel,
        triggerKey
    ]);
    let close = (0, $9cbje$react.useCallback)(()=>{
        setFocusStrategy(null);
        closeSubmenu(triggerKey, submenuLevel);
    }, [
        closeSubmenu,
        submenuLevel,
        triggerKey
    ]);
    let toggle = (0, $9cbje$react.useCallback)((focusStrategy)=>{
        setFocusStrategy(focusStrategy !== null && focusStrategy !== void 0 ? focusStrategy : null);
        if (isOpen) close();
        else open(focusStrategy);
    }, [
        close,
        open,
        isOpen
    ]);
    return (0, $9cbje$react.useMemo)(()=>({
            focusStrategy: focusStrategy,
            isOpen: isOpen,
            open: open,
            close: close,
            closeAll: closeAll,
            submenuLevel: submenuLevel,
            // TODO: Placeholders that aren't used but give us parity with OverlayTriggerState so we can use this in Popover. Refactor if we update Popover via
            // https://github.com/adobe/react-spectrum/pull/4976#discussion_r1336472863
            setOpen: ()=>{},
            toggle: toggle
        }), [
        isOpen,
        open,
        close,
        closeAll,
        focusStrategy,
        toggle,
        submenuLevel
    ]);
}


//# sourceMappingURL=useSubmenuTriggerState.main.js.map
