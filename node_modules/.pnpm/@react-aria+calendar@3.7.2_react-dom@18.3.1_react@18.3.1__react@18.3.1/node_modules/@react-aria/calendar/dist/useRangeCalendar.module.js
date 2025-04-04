import {useCalendarBase as $c4acc1de3ab169cf$export$d652b3ea2d672d5b} from "./useCalendarBase.module.js";
import {useEvent as $juhpn$useEvent} from "@react-aria/utils";
import {useRef as $juhpn$useRef} from "react";

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


function $46a4342aab3d8076$export$87e0539f600c24e5(props, state, ref) {
    let res = (0, $c4acc1de3ab169cf$export$d652b3ea2d672d5b)(props, state);
    // We need to ignore virtual pointer events from VoiceOver due to these bugs.
    // https://bugs.webkit.org/show_bug.cgi?id=222627
    // https://bugs.webkit.org/show_bug.cgi?id=223202
    // usePress also does this and waits for the following click event before firing.
    // We need to match that here otherwise this will fire before the press event in
    // useCalendarCell, causing range selection to not work properly.
    let isVirtualClick = (0, $juhpn$useRef)(false);
    let windowRef = (0, $juhpn$useRef)(typeof window !== 'undefined' ? window : null);
    (0, $juhpn$useEvent)(windowRef, 'pointerdown', (e)=>{
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
    (0, $juhpn$useEvent)(windowRef, 'pointerup', endDragging);
    // Also stop range selection on blur, e.g. tabbing away from the calendar.
    res.calendarProps.onBlur = (e)=>{
        if (!ref.current) return;
        if ((!e.relatedTarget || !ref.current.contains(e.relatedTarget)) && state.anchorDate) state.selectFocusedDate();
    };
    // Prevent touch scrolling while dragging
    (0, $juhpn$useEvent)(ref, 'touchmove', (e)=>{
        if (state.isDragging) e.preventDefault();
    }, {
        passive: false,
        capture: true
    });
    return res;
}


export {$46a4342aab3d8076$export$87e0539f600c24e5 as useRangeCalendar};
//# sourceMappingURL=useRangeCalendar.module.js.map
