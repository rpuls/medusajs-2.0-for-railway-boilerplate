var $08ef1685902b6011$exports = require("./ariaHideOutside.main.js");
var $82711f9cb668ecdb$exports = require("./useOverlay.main.js");
var $745edbb83ab4296f$exports = require("./Overlay.main.js");
var $5c2f5cd01815d369$exports = require("./usePreventScroll.main.js");
var $9ziDi$reactariautils = require("@react-aria/utils");
var $9ziDi$react = require("react");


function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "useModalOverlay", () => $11b7e0b04b421e95$export$dbc0f175b25fb0fb);
/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */ 





function $11b7e0b04b421e95$export$dbc0f175b25fb0fb(props, state, ref) {
    let { overlayProps: overlayProps, underlayProps: underlayProps } = (0, $82711f9cb668ecdb$exports.useOverlay)({
        ...props,
        isOpen: state.isOpen,
        onClose: state.close
    }, ref);
    (0, $5c2f5cd01815d369$exports.usePreventScroll)({
        isDisabled: !state.isOpen
    });
    (0, $745edbb83ab4296f$exports.useOverlayFocusContain)();
    (0, $9ziDi$react.useEffect)(()=>{
        if (state.isOpen && ref.current) return (0, $08ef1685902b6011$exports.ariaHideOutside)([
            ref.current
        ]);
    }, [
        state.isOpen,
        ref
    ]);
    return {
        modalProps: (0, $9ziDi$reactariautils.mergeProps)(overlayProps),
        underlayProps: underlayProps
    };
}


//# sourceMappingURL=useModalOverlay.main.js.map
