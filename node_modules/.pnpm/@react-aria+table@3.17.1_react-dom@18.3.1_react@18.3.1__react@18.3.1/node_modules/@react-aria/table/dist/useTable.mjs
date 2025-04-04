import {gridIds as $2140fb2337097f2d$export$552312adfd451dab} from "./utils.mjs";
import $dDeJM$intlStringsmodulejs from "./intlStrings.mjs";
import {TableKeyboardDelegate as $0ba3c81c7f1caedd$export$da43f8f5cb04028d} from "./TableKeyboardDelegate.mjs";
import {announce as $dDeJM$announce} from "@react-aria/live-announcer";
import {useGrid as $dDeJM$useGrid} from "@react-aria/grid";
import {useId as $dDeJM$useId, useDescription as $dDeJM$useDescription, useUpdateEffect as $dDeJM$useUpdateEffect, mergeProps as $dDeJM$mergeProps} from "@react-aria/utils";
import {tableNestedRows as $dDeJM$tableNestedRows} from "@react-stately/flags";
import {useCollator as $dDeJM$useCollator, useLocale as $dDeJM$useLocale, useLocalizedStringFormatter as $dDeJM$useLocalizedStringFormatter} from "@react-aria/i18n";
import {useMemo as $dDeJM$useMemo} from "react";


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








function $6e31608fbba75bab$export$25bceaac3c7e4dc7(props, state, ref) {
    let { keyboardDelegate: keyboardDelegate, isVirtualized: isVirtualized, layoutDelegate: layoutDelegate, layout: layout } = props;
    // By default, a KeyboardDelegate is provided which uses the DOM to query layout information (e.g. for page up/page down).
    // When virtualized, the layout object will be passed in as a prop and override this.
    let collator = (0, $dDeJM$useCollator)({
        usage: 'search',
        sensitivity: 'base'
    });
    let { direction: direction } = (0, $dDeJM$useLocale)();
    let disabledBehavior = state.selectionManager.disabledBehavior;
    let delegate = (0, $dDeJM$useMemo)(()=>keyboardDelegate || new (0, $0ba3c81c7f1caedd$export$da43f8f5cb04028d)({
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
    let id = (0, $dDeJM$useId)(props.id);
    (0, $2140fb2337097f2d$export$552312adfd451dab).set(state, id);
    let { gridProps: gridProps } = (0, $dDeJM$useGrid)({
        ...props,
        id: id,
        keyboardDelegate: delegate
    }, state, ref);
    // Override to include header rows
    if (isVirtualized) gridProps['aria-rowcount'] = state.collection.size + state.collection.headerRows.length;
    if ((0, $dDeJM$tableNestedRows)() && 'expandedKeys' in state) gridProps.role = 'treegrid';
    let { column: column, direction: sortDirection } = state.sortDescriptor || {};
    let stringFormatter = (0, $dDeJM$useLocalizedStringFormatter)((0, ($parcel$interopDefault($dDeJM$intlStringsmodulejs))), '@react-aria/table');
    let sortDescription = (0, $dDeJM$useMemo)(()=>{
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
    let descriptionProps = (0, $dDeJM$useDescription)(sortDescription);
    // Only announce after initial render, tabbing to the table will tell you the initial sort info already
    (0, $dDeJM$useUpdateEffect)(()=>{
        if (sortDescription) (0, $dDeJM$announce)(sortDescription, 'assertive', 500);
    }, [
        sortDescription
    ]);
    return {
        gridProps: (0, $dDeJM$mergeProps)(gridProps, descriptionProps, {
            // merge sort description with long press information
            'aria-describedby': [
                descriptionProps['aria-describedby'],
                gridProps['aria-describedby']
            ].filter(Boolean).join(' ')
        })
    };
}


export {$6e31608fbba75bab$export$25bceaac3c7e4dc7 as useTable};
//# sourceMappingURL=useTable.module.js.map
