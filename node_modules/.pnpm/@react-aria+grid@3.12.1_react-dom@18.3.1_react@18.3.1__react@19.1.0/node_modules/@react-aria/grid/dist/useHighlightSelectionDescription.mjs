import $kh5JA$intlStringsmodulejs from "./intlStrings.mjs";
import {useDescription as $kh5JA$useDescription} from "@react-aria/utils";
import {useInteractionModality as $kh5JA$useInteractionModality} from "@react-aria/interactions";
import {useLocalizedStringFormatter as $kh5JA$useLocalizedStringFormatter} from "@react-aria/i18n";
import {useMemo as $kh5JA$useMemo} from "react";


function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}
/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */ 




function $5b9b5b5723db6ae1$export$be42ebdab07ae4c2(props) {
    let stringFormatter = (0, $kh5JA$useLocalizedStringFormatter)((0, ($parcel$interopDefault($kh5JA$intlStringsmodulejs))), '@react-aria/grid');
    let modality = (0, $kh5JA$useInteractionModality)();
    // null is the default if the user hasn't interacted with the table at all yet or the rest of the page
    let shouldLongPress = (modality === 'pointer' || modality === 'virtual' || modality == null) && typeof window !== 'undefined' && 'ontouchstart' in window;
    let interactionDescription = (0, $kh5JA$useMemo)(()=>{
        let selectionMode = props.selectionManager.selectionMode;
        let selectionBehavior = props.selectionManager.selectionBehavior;
        let message;
        if (shouldLongPress) message = stringFormatter.format('longPressToSelect');
        return selectionBehavior === 'replace' && selectionMode !== 'none' && props.hasItemActions ? message : undefined;
    }, [
        props.selectionManager.selectionMode,
        props.selectionManager.selectionBehavior,
        props.hasItemActions,
        stringFormatter,
        shouldLongPress
    ]);
    let descriptionProps = (0, $kh5JA$useDescription)(interactionDescription);
    return descriptionProps;
}


export {$5b9b5b5723db6ae1$export$be42ebdab07ae4c2 as useHighlightSelectionDescription};
//# sourceMappingURL=useHighlightSelectionDescription.module.js.map
