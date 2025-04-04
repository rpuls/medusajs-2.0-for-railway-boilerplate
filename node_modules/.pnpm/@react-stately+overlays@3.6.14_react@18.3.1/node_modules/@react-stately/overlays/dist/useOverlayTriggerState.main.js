var $62yjz$react = require("react");
var $62yjz$reactstatelyutils = require("@react-stately/utils");


function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "useOverlayTriggerState", () => $5076d97fb6884665$export$61c6a8c84e605fb6);
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

function $5076d97fb6884665$export$61c6a8c84e605fb6(props) {
    let [isOpen, setOpen] = (0, $62yjz$reactstatelyutils.useControlledState)(props.isOpen, props.defaultOpen || false, props.onOpenChange);
    const open = (0, $62yjz$react.useCallback)(()=>{
        setOpen(true);
    }, [
        setOpen
    ]);
    const close = (0, $62yjz$react.useCallback)(()=>{
        setOpen(false);
    }, [
        setOpen
    ]);
    const toggle = (0, $62yjz$react.useCallback)(()=>{
        setOpen(!isOpen);
    }, [
        setOpen,
        isOpen
    ]);
    return {
        isOpen: isOpen,
        setOpen: setOpen,
        open: open,
        close: close,
        toggle: toggle
    };
}


//# sourceMappingURL=useOverlayTriggerState.main.js.map
