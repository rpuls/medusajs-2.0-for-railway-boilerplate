var $6acf696f746f932c$exports = require("./utils.main.js");
var $7ff3f66df3873a5e$exports = require("./intlStrings.main.js");
var $33PgG$reactariautils = require("@react-aria/utils");
var $33PgG$react = require("react");
var $33PgG$reactariainteractions = require("@react-aria/interactions");
var $33PgG$reactariagrid = require("@react-aria/grid");
var $33PgG$reactariai18n = require("@react-aria/i18n");


function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}

function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "useTableColumnHeader", () => $7669c34a63ef0113$export$9514819a8c81e960);
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






function $7669c34a63ef0113$export$9514819a8c81e960(props, state, ref) {
    var _state_sortDescriptor, _state_sortDescriptor1;
    let { node: node } = props;
    let allowsSorting = node.props.allowsSorting;
    // if there are no focusable children, the column header will focus the cell
    let { gridCellProps: gridCellProps } = (0, $33PgG$reactariagrid.useGridCell)({
        ...props,
        focusMode: 'child'
    }, state, ref);
    let isSelectionCellDisabled = node.props.isSelectionCell && state.selectionManager.selectionMode === 'single';
    let { pressProps: pressProps } = (0, $33PgG$reactariainteractions.usePress)({
        isDisabled: !allowsSorting || isSelectionCellDisabled,
        onPress () {
            state.sort(node.key);
        },
        ref: ref
    });
    // Needed to pick up the focusable context, enabling things like Tooltips for example
    let { focusableProps: focusableProps } = (0, $33PgG$reactariainteractions.useFocusable)({}, ref);
    let ariaSort = undefined;
    let isSortedColumn = ((_state_sortDescriptor = state.sortDescriptor) === null || _state_sortDescriptor === void 0 ? void 0 : _state_sortDescriptor.column) === node.key;
    let sortDirection = (_state_sortDescriptor1 = state.sortDescriptor) === null || _state_sortDescriptor1 === void 0 ? void 0 : _state_sortDescriptor1.direction;
    // aria-sort not supported in Android Talkback
    if (node.props.allowsSorting && !(0, $33PgG$reactariautils.isAndroid)()) ariaSort = isSortedColumn ? sortDirection : 'none';
    let stringFormatter = (0, $33PgG$reactariai18n.useLocalizedStringFormatter)((0, ($parcel$interopDefault($7ff3f66df3873a5e$exports))), '@react-aria/table');
    let sortDescription;
    if (allowsSorting) {
        sortDescription = `${stringFormatter.format('sortable')}`;
        // Android Talkback doesn't support aria-sort so we add sort order details to the aria-described by here
        if (isSortedColumn && sortDirection && (0, $33PgG$reactariautils.isAndroid)()) sortDescription = `${sortDescription}, ${stringFormatter.format(sortDirection)}`;
    }
    let descriptionProps = (0, $33PgG$reactariautils.useDescription)(sortDescription);
    let shouldDisableFocus = state.collection.size === 0;
    (0, $33PgG$react.useEffect)(()=>{
        if (shouldDisableFocus && state.selectionManager.focusedKey === node.key) state.selectionManager.setFocusedKey(null);
    }, [
        shouldDisableFocus,
        state.selectionManager,
        node.key
    ]);
    return {
        columnHeaderProps: {
            ...(0, $33PgG$reactariautils.mergeProps)(focusableProps, gridCellProps, pressProps, descriptionProps, // If the table is empty, make all column headers untabbable
            shouldDisableFocus ? {
                tabIndex: -1
            } : null),
            role: 'columnheader',
            id: (0, $6acf696f746f932c$exports.getColumnHeaderId)(state, node.key),
            'aria-colspan': node.colSpan && node.colSpan > 1 ? node.colSpan : undefined,
            'aria-sort': ariaSort
        }
    };
}


//# sourceMappingURL=useTableColumnHeader.main.js.map
