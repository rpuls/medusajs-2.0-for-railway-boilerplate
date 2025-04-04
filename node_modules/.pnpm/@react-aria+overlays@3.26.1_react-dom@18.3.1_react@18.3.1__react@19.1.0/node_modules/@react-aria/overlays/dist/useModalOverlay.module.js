import {ariaHideOutside as $5e3802645cc19319$export$1c3ebcada18427bf} from "./ariaHideOutside.module.js";
import {useOverlay as $a11501f3d1d39e6c$export$ea8f71083e90600f} from "./useOverlay.module.js";
import {useOverlayFocusContain as $337b884510726a0d$export$14c98a7594375490} from "./Overlay.module.js";
import {usePreventScroll as $49c51c25361d4cd2$export$ee0f7cc6afcd1c18} from "./usePreventScroll.module.js";
import {mergeProps as $7Dhkr$mergeProps} from "@react-aria/utils";
import {useEffect as $7Dhkr$useEffect} from "react";

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





function $8ac8429251c45e4b$export$dbc0f175b25fb0fb(props, state, ref) {
    let { overlayProps: overlayProps, underlayProps: underlayProps } = (0, $a11501f3d1d39e6c$export$ea8f71083e90600f)({
        ...props,
        isOpen: state.isOpen,
        onClose: state.close
    }, ref);
    (0, $49c51c25361d4cd2$export$ee0f7cc6afcd1c18)({
        isDisabled: !state.isOpen
    });
    (0, $337b884510726a0d$export$14c98a7594375490)();
    (0, $7Dhkr$useEffect)(()=>{
        if (state.isOpen && ref.current) return (0, $5e3802645cc19319$export$1c3ebcada18427bf)([
            ref.current
        ]);
    }, [
        state.isOpen,
        ref
    ]);
    return {
        modalProps: (0, $7Dhkr$mergeProps)(overlayProps),
        underlayProps: underlayProps
    };
}


export {$8ac8429251c45e4b$export$dbc0f175b25fb0fb as useModalOverlay};
//# sourceMappingURL=useModalOverlay.module.js.map
