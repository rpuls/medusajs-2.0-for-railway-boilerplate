var $5Cus8$reactstatelycollections = require("@react-stately/collections");
var $5Cus8$reactstatelyselection = require("@react-stately/selection");
var $5Cus8$react = require("react");


function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "useGridState", () => $38009b28e45912ea$export$4007ac09ff9c68ed);



function $38009b28e45912ea$export$4007ac09ff9c68ed(props) {
    let { collection: collection, focusMode: focusMode } = props;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    let selectionState = props.UNSAFE_selectionState || (0, $5Cus8$reactstatelyselection.useMultipleSelectionState)(props);
    let disabledKeys = (0, $5Cus8$react.useMemo)(()=>props.disabledKeys ? new Set(props.disabledKeys) : new Set(), [
        props.disabledKeys
    ]);
    let setFocusedKey = selectionState.setFocusedKey;
    selectionState.setFocusedKey = (key, child)=>{
        // If focusMode is cell and an item is focused, focus a child cell instead.
        if (focusMode === 'cell' && key != null) {
            let item = collection.getItem(key);
            if ((item === null || item === void 0 ? void 0 : item.type) === 'item') {
                var _getLastItem, _getFirstItem;
                let children = (0, $5Cus8$reactstatelycollections.getChildNodes)(item, collection);
                var _getLastItem_key, _getFirstItem_key;
                if (child === 'last') key = (_getLastItem_key = (_getLastItem = (0, $5Cus8$reactstatelycollections.getLastItem)(children)) === null || _getLastItem === void 0 ? void 0 : _getLastItem.key) !== null && _getLastItem_key !== void 0 ? _getLastItem_key : null;
                else key = (_getFirstItem_key = (_getFirstItem = (0, $5Cus8$reactstatelycollections.getFirstItem)(children)) === null || _getFirstItem === void 0 ? void 0 : _getFirstItem.key) !== null && _getFirstItem_key !== void 0 ? _getFirstItem_key : null;
            }
        }
        setFocusedKey(key, child);
    };
    let selectionManager = (0, $5Cus8$react.useMemo)(()=>new (0, $5Cus8$reactstatelyselection.SelectionManager)(collection, selectionState), [
        collection,
        selectionState
    ]);
    // Reset focused key if that item is deleted from the collection.
    const cachedCollection = (0, $5Cus8$react.useRef)(null);
    (0, $5Cus8$react.useEffect)(()=>{
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
                    ...(0, $5Cus8$reactstatelycollections.getChildNodes)(newRow, collection)
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


//# sourceMappingURL=useGridState.main.js.map
