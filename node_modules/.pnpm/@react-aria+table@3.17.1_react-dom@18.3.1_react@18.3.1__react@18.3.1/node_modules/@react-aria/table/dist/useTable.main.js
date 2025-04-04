var $6acf696f746f932c$exports = require("./utils.main.js");
var $7ff3f66df3873a5e$exports = require("./intlStrings.main.js");
var $a911ff492b884835$exports = require("./TableKeyboardDelegate.main.js");
var $aZ1Oy$reactarialiveannouncer = require("@react-aria/live-announcer");
var $aZ1Oy$reactariagrid = require("@react-aria/grid");
var $aZ1Oy$reactariautils = require("@react-aria/utils");
var $aZ1Oy$reactstatelyflags = require("@react-stately/flags");
var $aZ1Oy$reactariai18n = require("@react-aria/i18n");
var $aZ1Oy$react = require("react");


function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}

function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "useTable", () => $25d14c0f8fad722e$export$25bceaac3c7e4dc7);
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








function $25d14c0f8fad722e$export$25bceaac3c7e4dc7(props, state, ref) {
    let { keyboardDelegate: keyboardDelegate, isVirtualized: isVirtualized, layoutDelegate: layoutDelegate, layout: layout } = props;
    // By default, a KeyboardDelegate is provided which uses the DOM to query layout information (e.g. for page up/page down).
    // When virtualized, the layout object will be passed in as a prop and override this.
    let collator = (0, $aZ1Oy$reactariai18n.useCollator)({
        usage: 'search',
        sensitivity: 'base'
    });
    let { direction: direction } = (0, $aZ1Oy$reactariai18n.useLocale)();
    let disabledBehavior = state.selectionManager.disabledBehavior;
    let delegate = (0, $aZ1Oy$react.useMemo)(()=>keyboardDelegate || new (0, $a911ff492b884835$exports.TableKeyboardDelegate)({
            collection: state.collection,
            disabledKeys: state.disabledKeys,
            disabledBehavior: disabledBehavior,
            ref: ref,
            direction: direction,
            collator: collator,
            layoutDelegate: layoutDelegate,
            layout: layout
        }), [
        keyboardDelegate,
        state.collection,
        state.disabledKeys,
        disabledBehavior,
        ref,
        direction,
        collator,
        layoutDelegate,
        layout
    ]);
    let id = (0, $aZ1Oy$reactariautils.useId)(props.id);
    (0, $6acf696f746f932c$exports.gridIds).set(state, id);
    let { gridProps: gridProps } = (0, $aZ1Oy$reactariagrid.useGrid)({
        ...props,
        id: id,
        keyboardDelegate: delegate
    }, state, ref);
    // Override to include header rows
    if (isVirtualized) gridProps['aria-rowcount'] = state.collection.size + state.collection.headerRows.length;
    if ((0, $aZ1Oy$reactstatelyflags.tableNestedRows)() && 'expandedKeys' in state) gridProps.role = 'treegrid';
    let { column: column, direction: sortDirection } = state.sortDescriptor || {};
    let stringFormatter = (0, $aZ1Oy$reactariai18n.useLocalizedStringFormatter)((0, ($parcel$interopDefault($7ff3f66df3873a5e$exports))), '@react-aria/table');
    let sortDescription = (0, $aZ1Oy$react.useMemo)(()=>{
        var _state_collection_columns_find;
        var _state_collection_columns_find_textValue;
        let columnName = (_state_collection_columns_find_textValue = (_state_collection_columns_find = state.collection.columns.find((c)=>c.key === column)) === null || _state_collection_columns_find === void 0 ? void 0 : _state_collection_columns_find.textValue) !== null && _state_collection_columns_find_textValue !== void 0 ? _state_collection_columns_find_textValue : '';
        return sortDirection && column ? stringFormatter.format(`${sortDirection}Sort`, {
            columnName: columnName
        }) : undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        sortDirection,
        column,
        state.collection.columns
    ]);
    let descriptionProps = (0, $aZ1Oy$reactariautils.useDescription)(sortDescription);
    // Only announce after initial render, tabbing to the table will tell you the initial sort info already
    (0, $aZ1Oy$reactariautils.useUpdateEffect)(()=>{
        if (sortDescription) (0, $aZ1Oy$reactarialiveannouncer.announce)(sortDescription, 'assertive', 500);
    }, [
        sortDescription
    ]);
    return {
        gridProps: (0, $aZ1Oy$reactariautils.mergeProps)(gridProps, descriptionProps, {
            // merge sort description with long press information
            'aria-describedby': [
                descriptionProps['aria-describedby'],
                gridProps['aria-describedby']
            ].filter(Boolean).join(' ')
        })
    };
}


//# sourceMappingURL=useTable.main.js.map
