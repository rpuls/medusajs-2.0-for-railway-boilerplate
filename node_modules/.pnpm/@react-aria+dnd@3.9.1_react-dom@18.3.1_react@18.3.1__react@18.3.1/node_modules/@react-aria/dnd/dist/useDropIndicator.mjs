import {useDragSession as $67560de7c78cb232$export$418e185dd3f1b968} from "./DragManager.mjs";
import {getDroppableCollectionId as $7252cd45fc48c07c$export$3093291712f09a77} from "./utils.mjs";
import $8HwJV$intlStringsmodulejs from "./intlStrings.mjs";
import {useDroppableItem as $bfaab576ce1c580e$export$f7b0c5d28b66b6a5} from "./useDroppableItem.mjs";
import {useId as $8HwJV$useId} from "@react-aria/utils";
import {useLocalizedStringFormatter as $8HwJV$useLocalizedStringFormatter} from "@react-aria/i18n";


function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}
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





function $ddf25448c71fc93a$export$8d0e41d2815afac5(props, state, ref) {
    let { target: target } = props;
    let { collection: collection } = state;
    let stringFormatter = (0, $8HwJV$useLocalizedStringFormatter)((0, ($parcel$interopDefault($8HwJV$intlStringsmodulejs))), '@react-aria/dnd');
    let dragSession = $67560de7c78cb232$export$418e185dd3f1b968();
    let { dropProps: dropProps } = (0, $bfaab576ce1c580e$export$f7b0c5d28b66b6a5)(props, state, ref);
    let id = (0, $8HwJV$useId)();
    let getText = (key)=>{
        var _collection_getTextValue, _collection_getItem;
        var _collection_getTextValue1, _ref;
        if (key == null) return '';
        else return (_ref = (_collection_getTextValue1 = (_collection_getTextValue = collection.getTextValue) === null || _collection_getTextValue === void 0 ? void 0 : _collection_getTextValue.call(collection, key)) !== null && _collection_getTextValue1 !== void 0 ? _collection_getTextValue1 : (_collection_getItem = collection.getItem(key)) === null || _collection_getItem === void 0 ? void 0 : _collection_getItem.textValue) !== null && _ref !== void 0 ? _ref : '';
    };
    let label = '';
    let labelledBy;
    if (target.type === 'root') {
        label = stringFormatter.format('dropOnRoot');
        labelledBy = `${id} ${(0, $7252cd45fc48c07c$export$3093291712f09a77)(state)}`;
    } else if (target.dropPosition === 'on') label = stringFormatter.format('dropOnItem', {
        itemText: getText(target.key)
    });
    else {
        let before;
        let after;
        if (collection.getFirstKey() === target.key && target.dropPosition === 'before') before = null;
        else before = target.dropPosition === 'before' ? collection.getKeyBefore(target.key) : target.key;
        if (collection.getLastKey() === target.key && target.dropPosition === 'after') after = null;
        else after = target.dropPosition === 'after' ? collection.getKeyAfter(target.key) : target.key;
        if (before && after) label = stringFormatter.format('insertBetween', {
            beforeItemText: getText(before),
            afterItemText: getText(after)
        });
        else if (before) label = stringFormatter.format('insertAfter', {
            itemText: getText(before)
        });
        else if (after) label = stringFormatter.format('insertBefore', {
            itemText: getText(after)
        });
    }
    let isDropTarget = state.isDropTarget(target);
    let ariaHidden = !dragSession ? 'true' : dropProps['aria-hidden'];
    return {
        dropIndicatorProps: {
            ...dropProps,
            id: id,
            'aria-roledescription': stringFormatter.format('dropIndicator'),
            'aria-label': label,
            'aria-labelledby': labelledBy,
            'aria-hidden': ariaHidden,
            tabIndex: -1
        },
        isDropTarget: isDropTarget,
        // If aria-hidden, we are either not in a drag session or the drop target is invalid.
        // In that case, there's no need to render anything at all unless we need to show the indicator visually.
        // This can happen when dragging using the native DnD API as opposed to keyboard dragging.
        isHidden: !isDropTarget && !!ariaHidden
    };
}


export {$ddf25448c71fc93a$export$8d0e41d2815afac5 as useDropIndicator};
//# sourceMappingURL=useDropIndicator.module.js.map
