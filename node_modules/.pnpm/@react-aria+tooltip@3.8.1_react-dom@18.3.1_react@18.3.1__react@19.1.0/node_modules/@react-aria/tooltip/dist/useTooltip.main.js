var $1ztb7$reactariautils = require("@react-aria/utils");
var $1ztb7$reactariainteractions = require("@react-aria/interactions");


function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "useTooltip", () => $199fa2aaa84f20b7$export$1c4b08e0eca38426);
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

function $199fa2aaa84f20b7$export$1c4b08e0eca38426(props, state) {
    let domProps = (0, $1ztb7$reactariautils.filterDOMProps)(props, {
        labelable: true
    });
    let { hoverProps: hoverProps } = (0, $1ztb7$reactariainteractions.useHover)({
        onHoverStart: ()=>state === null || state === void 0 ? void 0 : state.open(true),
        onHoverEnd: ()=>state === null || state === void 0 ? void 0 : state.close()
    });
    return {
        tooltipProps: (0, $1ztb7$reactariautils.mergeProps)(domProps, hoverProps, {
            role: 'tooltip'
        })
    };
}


//# sourceMappingURL=useTooltip.main.js.map
