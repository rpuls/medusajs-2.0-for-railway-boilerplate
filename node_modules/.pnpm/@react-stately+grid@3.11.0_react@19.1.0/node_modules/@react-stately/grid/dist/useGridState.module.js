import {getChildNodes as $7nPCv$getChildNodes, getLastItem as $7nPCv$getLastItem, getFirstItem as $7nPCv$getFirstItem} from "@react-stately/collections";
import {useMultipleSelectionState as $7nPCv$useMultipleSelectionState, SelectionManager as $7nPCv$SelectionManager} from "@react-stately/selection";
import {useMemo as $7nPCv$useMemo, useRef as $7nPCv$useRef, useEffect as $7nPCv$useEffect} from "react";




function $62967d126f3aa823$export$4007ac09ff9c68ed(props) {
    let { collection: collection, focusMode: focusMode } = props;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    let selectionState = props.UNSAFE_selectionState || (0, $7nPCv$useMultipleSelectionState)(props);
    let disabledKeys = (0, $7nPCv$useMemo)(()=>props.disabledKeys ? new Set(props.disabledKeys) : new Set(), [
        props.disabledKeys
    ]);
    let setFocusedKey = selectionState.setFocusedKey;
    selectionState.setFocusedKey = (key, child)=>{
        // If focusMode is cell and an item is focused, focus a child cell instead.
        if (focusMode === 'cell' && key != null) {
            let item = collection.getItem(key);
            if ((item === null || item === void 0 ? void 0 : item.type) === 'item') {
                var _getLastItem, _getFirstItem;
                let children = (0, $7nPCv$getChildNodes)(item, collection);
                var _getLastItem_key, _getFirstItem_key;
                if (child === 'last') key = (_getLastItem_key = (_getLastItem = (0, $7nPCv$getLastItem)(children)) === null || _getLastItem === void 0 ? void 0 : _getLastItem.key) !== null && _getLastItem_key !== void 0 ? _getLastItem_key : null;
                else key = (_getFirstItem_key = (_getFirstItem = (0, $7nPCv$getFirstItem)(children)) === null || _getFirstItem === void 0 ? void 0 : _getFirstItem.key) !== null && _getFirstItem_key !== void 0 ? _getFirstItem_key : null;
            }
        }
        setFocusedKey(key, child);
    };
    let selectionManager = (0, $7nPCv$useMemo)(()=>new (0, $7nPCv$SelectionManager)(collection, selectionState), [
        collection,
        selectionState
    ]);
    // Reset focused key if that item is deleted from the collection.
    const cachedCollection = (0, $7nPCv$useRef)(null);
    (0, $7nPCv$useEffect)(()=>{
        if (selectionState.focusedKey != null && cachedCollection.current && !collection.getItem(selectionState.focusedKey)) {
            const node = cachedCollection.current.getItem(selectionState.focusedKey);
            const parentNode = (node === null || node === void 0 ? void 0 : node.parentKey) != null && (node.type === 'cell' || node.type === 'rowheader' || node.type === 'column') ? cachedCollection.current.getItem(node.parentKey) : node;
            if (!parentNode) {
                selectionState.setFocusedKey(null);
                return;
            }
            const cachedRows = cachedCollection.current.rows;
            const rows = collection.rows;
            const diff = cachedRows.length - rows.length;
            let index = Math.min(diff > 1 ? Math.max(parentNode.index - diff + 1, 0) : parentNode.index, rows.length - 1);
            let newRow = null;
            while(index >= 0){
                if (!selectionManager.isDisabled(rows[index].key) && rows[index].type !== 'headerrow') {
                    newRow = rows[index];
                    break;
                }
                // Find next, not disabled row.
                if (index < rows.length - 1) index++;
                else {
                    if (index > parentNode.index) index = parentNode.index;
                    index--;
                }
            }
            if (newRow) {
                const childNodes = newRow.hasChildNodes ? [
                    ...(0, $7nPCv$getChildNodes)(newRow, collection)
                ] : [];
                const keyToFocus = newRow.hasChildNodes && parentNode !== node && node && node.index < childNodes.length ? childNodes[node.index].key : newRow.key;
                selectionState.setFocusedKey(keyToFocus);
            } else selectionState.setFocusedKey(null);
        }
        cachedCollection.current = collection;
    }, [
        collection,
        selectionManager,
        selectionState,
        selectionState.focusedKey
    ]);
    return {
        collection: collection,
        disabledKeys: disabledKeys,
        isKeyboardNavigationDisabled: false,
        selectionManager: selectionManager
    };
}


export {$62967d126f3aa823$export$4007ac09ff9c68ed as useGridState};
//# sourceMappingURL=useGridState.module.js.map
