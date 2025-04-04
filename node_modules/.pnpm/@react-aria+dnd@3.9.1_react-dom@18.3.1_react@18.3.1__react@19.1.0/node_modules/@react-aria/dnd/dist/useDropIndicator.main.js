var $28e10663603f5ea1$exports = require("./DragManager.main.js");
var $4620ae0dc40f0031$exports = require("./utils.main.js");
var $7c8adf3925a26206$exports = require("./intlStrings.main.js");
var $fc1876157e07bcec$exports = require("./useDroppableItem.main.js");
var $Zlq1e$reactariautils = require("@react-aria/utils");
var $Zlq1e$reactariai18n = require("@react-aria/i18n");


function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}

function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "useDropIndicator", () => $c5557edbed563ebf$export$8d0e41d2815afac5);
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





function $c5557edbed563ebf$export$8d0e41d2815afac5(props, state, ref) {
    let { target: target } = props;
    let { collection: collection } = state;
    let stringFormatter = (0, $Zlq1e$reactariai18n.useLocalizedStringFormatter)((0, ($parcel$interopDefault($7c8adf3925a26206$exports))), '@react-aria/dnd');
    let dragSession = $28e10663603f5ea1$exports.useDragSession();
    let { dropProps: dropProps } = (0, $fc1876157e07bcec$exports.useDroppableItem)(props, state, ref);
    let id = (0, $Zlq1e$reactariautils.useId)();
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
        labelledBy = `${id} ${(0, $4620ae0dc40f0031$exports.getDroppableCollectionId)(state)}`;
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


//# sourceMappingURL=useDropIndicator.main.js.map
