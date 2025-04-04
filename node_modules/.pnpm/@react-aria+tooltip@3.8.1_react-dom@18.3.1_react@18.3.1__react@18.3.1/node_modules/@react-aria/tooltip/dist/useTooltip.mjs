import {filterDOMProps as $kwmr2$filterDOMProps, mergeProps as $kwmr2$mergeProps} from "@react-aria/utils";
import {useHover as $kwmr2$useHover} from "@react-aria/interactions";

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

function $326e436e94273fe1$export$1c4b08e0eca38426(props, state) {
    let domProps = (0, $kwmr2$filterDOMProps)(props, {
        labelable: true
    });
    let { hoverProps: hoverProps } = (0, $kwmr2$useHover)({
        onHoverStart: ()=>state === null || state === void 0 ? void 0 : state.open(true),
        onHoverEnd: ()=>state === null || state === void 0 ? void 0 : state.close()
    });
    return {
        tooltipProps: (0, $kwmr2$mergeProps)(domProps, hoverProps, {
            role: 'tooltip'
        })
    };
}


export {$326e436e94273fe1$export$1c4b08e0eca38426 as useTooltip};
//# sourceMappingURL=useTooltip.module.js.map
