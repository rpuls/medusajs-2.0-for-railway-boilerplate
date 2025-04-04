var $02ef492a56b91cb2$exports = require("./useCalendarBase.main.js");
var $3kfPe$reactariautils = require("@react-aria/utils");
var $3kfPe$react = require("react");


function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "useRangeCalendar", () => $c49ada48cbc48220$export$87e0539f600c24e5);
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


function $c49ada48cbc48220$export$87e0539f600c24e5(props, state, ref) {
    let res = (0, $02ef492a56b91cb2$exports.useCalendarBase)(props, state);
    // We need to ignore virtual pointer events from VoiceOver due to these bugs.
    // https://bugs.webkit.org/show_bug.cgi?id=222627
    // https://bugs.webkit.org/show_bug.cgi?id=223202
    // usePress also does this and waits for the following click event before firing.
    // We need to match that here otherwise this will fire before the press event in
    // useCalendarCell, causing range selection to not work properly.
    let isVirtualClick = (0, $3kfPe$react.useRef)(false);
    let windowRef = (0, $3kfPe$react.useRef)(typeof window !== 'undefined' ? window : null);
    (0, $3kfPe$reactariautils.useEvent)(windowRef, 'pointerdown', (e)=>{
        isVirtualClick.current = e.width === 0 && e.height === 0;
    });
    // Stop range selection when pressing or releasing a pointer outside the calendar body,
    // except when pressing the next or previous buttons to switch months.
    let endDragging = (e)=>{
        if (isVirtualClick.current) {
            isVirtualClick.current = false;
            return;
        }
        state.setDragging(false);
        if (!state.anchorDate) return;
        let target = e.target;
        if (ref.current && ref.current.contains(document.activeElement) && (!ref.current.contains(target) || !target.closest('button, [role="button"]'))) state.selectFocusedDate();
    };
    (0, $3kfPe$reactariautils.useEvent)(windowRef, 'pointerup', endDragging);
    // Also stop range selection on blur, e.g. tabbing away from the calendar.
    res.calendarProps.onBlur = (e)=>{
        if (!ref.current) return;
        if ((!e.relatedTarget || !ref.current.contains(e.relatedTarget)) && state.anchorDate) state.selectFocusedDate();
    };
    // Prevent touch scrolling while dragging
    (0, $3kfPe$reactariautils.useEvent)(ref, 'touchmove', (e)=>{
        if (state.isDragging) e.preventDefault();
    }, {
        passive: false,
        capture: true
    });
    return res;
}


//# sourceMappingURL=useRangeCalendar.main.js.map
