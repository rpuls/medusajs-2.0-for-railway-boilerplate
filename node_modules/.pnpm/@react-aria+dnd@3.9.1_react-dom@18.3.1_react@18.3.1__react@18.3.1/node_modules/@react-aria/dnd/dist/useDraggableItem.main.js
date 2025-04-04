var $4620ae0dc40f0031$exports = require("./utils.main.js");
var $7c8adf3925a26206$exports = require("./intlStrings.main.js");
var $dc204e8ec58447a6$exports = require("./useDrag.main.js");
var $6Ms7J$reactariautils = require("@react-aria/utils");
var $6Ms7J$reactariai18n = require("@react-aria/i18n");


function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}

function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "useDraggableItem", () => $0cbbd00cda972c67$export$b35afafff42da2d9);
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




const $0cbbd00cda972c67$var$MESSAGES = {
    keyboard: {
        selected: 'dragSelectedKeyboard',
        notSelected: 'dragDescriptionKeyboard'
    },
    touch: {
        selected: 'dragSelectedLongPress',
        notSelected: 'dragDescriptionLongPress'
    },
    virtual: {
        selected: 'dragDescriptionVirtual',
        notSelected: 'dragDescriptionVirtual'
    }
};
function $0cbbd00cda972c67$export$b35afafff42da2d9(props, state) {
    let stringFormatter = (0, $6Ms7J$reactariai18n.useLocalizedStringFormatter)((0, ($parcel$interopDefault($7c8adf3925a26206$exports))), '@react-aria/dnd');
    let isDisabled = state.isDisabled || state.selectionManager.isDisabled(props.key);
    let { dragProps: dragProps, dragButtonProps: dragButtonProps } = (0, $dc204e8ec58447a6$exports.useDrag)({
        getItems () {
            return state.getItems(props.key);
        },
        preview: state.preview,
        getAllowedDropOperations: state.getAllowedDropOperations,
        hasDragButton: props.hasDragButton,
        onDragStart (e) {
            state.startDrag(props.key, e);
            // Track draggingKeys for useDroppableCollection's default onDrop handler and useDroppableCollectionState's default getDropOperation
            (0, $4620ae0dc40f0031$exports.setDraggingKeys)(state.draggingKeys);
        },
        onDragMove (e) {
            state.moveDrag(e);
        },
        onDragEnd (e) {
            let { dropOperation: dropOperation } = e;
            let isInternal = dropOperation === 'cancel' ? false : (0, $4620ae0dc40f0031$exports.isInternalDropOperation)();
            state.endDrag({
                ...e,
                keys: state.draggingKeys,
                isInternal: isInternal
            });
            (0, $4620ae0dc40f0031$exports.clearGlobalDnDState)();
        }
    });
    let item = state.collection.getItem(props.key);
    let numKeysForDrag = state.getKeysForDrag(props.key).size;
    let isSelected = numKeysForDrag > 1 && state.selectionManager.isSelected(props.key);
    let dragButtonLabel;
    let description;
    // Override description to include selected item count.
    let modality = (0, $4620ae0dc40f0031$exports.useDragModality)();
    if (!props.hasDragButton && state.selectionManager.selectionMode !== 'none') {
        let msg = $0cbbd00cda972c67$var$MESSAGES[modality][isSelected ? 'selected' : 'notSelected'];
        if (props.hasAction && modality === 'keyboard') msg += 'Alt';
        if (isSelected) description = stringFormatter.format(msg, {
            count: numKeysForDrag
        });
        else description = stringFormatter.format(msg);
        // Remove the onClick handler from useDrag. Long pressing will be required on touch devices,
        // and NVDA/JAWS are always in forms mode within collection components.
        delete dragProps.onClick;
    } else if (isSelected) dragButtonLabel = stringFormatter.format('dragSelectedItems', {
        count: numKeysForDrag
    });
    else {
        var _state_collection_getTextValue, _state_collection;
        var _state_collection_getTextValue1, _ref;
        let itemText = (_ref = (_state_collection_getTextValue1 = (_state_collection_getTextValue = (_state_collection = state.collection).getTextValue) === null || _state_collection_getTextValue === void 0 ? void 0 : _state_collection_getTextValue.call(_state_collection, props.key)) !== null && _state_collection_getTextValue1 !== void 0 ? _state_collection_getTextValue1 : item === null || item === void 0 ? void 0 : item.textValue) !== null && _ref !== void 0 ? _ref : '';
        dragButtonLabel = stringFormatter.format('dragItem', {
            itemText: itemText
        });
    }
    let descriptionProps = (0, $6Ms7J$reactariautils.useDescription)(description);
    if (description) Object.assign(dragProps, descriptionProps);
    if (!props.hasDragButton && props.hasAction) {
        let { onKeyDownCapture: onKeyDownCapture, onKeyUpCapture: onKeyUpCapture } = dragProps;
        if (modality === 'touch') // Remove long press description if an action is present, because in that case long pressing selects the item.
        delete dragProps['aria-describedby'];
        // Require Alt key if there is a conflicting action.
        dragProps.onKeyDownCapture = (e)=>{
            if (e.altKey) onKeyDownCapture === null || onKeyDownCapture === void 0 ? void 0 : onKeyDownCapture(e);
        };
        dragProps.onKeyUpCapture = (e)=>{
            if (e.altKey) onKeyUpCapture === null || onKeyUpCapture === void 0 ? void 0 : onKeyUpCapture(e);
        };
    }
    return {
        dragProps: isDisabled ? {} : dragProps,
        dragButtonProps: {
            ...dragButtonProps,
            isDisabled: isDisabled,
            'aria-label': dragButtonLabel
        }
    };
}


//# sourceMappingURL=useDraggableItem.main.js.map
