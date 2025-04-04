import {getRowLabelledBy as $2140fb2337097f2d$export$85069b70317f543} from "./utils.mjs";
import $iIuaM$intlStringsmodulejs from "./intlStrings.mjs";
import {useGridSelectionCheckbox as $iIuaM$useGridSelectionCheckbox} from "@react-aria/grid";
import {useLocalizedStringFormatter as $iIuaM$useLocalizedStringFormatter} from "@react-aria/i18n";


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



function $2a795c53a101c542$export$16ea7f650bd7c1bb(props, state) {
    let { key: key } = props;
    const { checkboxProps: checkboxProps } = (0, $iIuaM$useGridSelectionCheckbox)(props, state);
    return {
        checkboxProps: {
            ...checkboxProps,
            'aria-labelledby': `${checkboxProps.id} ${(0, $2140fb2337097f2d$export$85069b70317f543)(state, key)}`
        }
    };
}
function $2a795c53a101c542$export$1003db6a7e384b99(state) {
    let { isEmpty: isEmpty, isSelectAll: isSelectAll, selectionMode: selectionMode } = state.selectionManager;
    const stringFormatter = (0, $iIuaM$useLocalizedStringFormatter)((0, ($parcel$interopDefault($iIuaM$intlStringsmodulejs))), '@react-aria/table');
    return {
        checkboxProps: {
            'aria-label': stringFormatter.format(selectionMode === 'single' ? 'select' : 'selectAll'),
            isSelected: isSelectAll,
            isDisabled: selectionMode !== 'multiple' || state.collection.size === 0,
            isIndeterminate: !isEmpty && !isSelectAll,
            onChange: ()=>state.selectionManager.toggleSelectAll()
        }
    };
}


export {$2a795c53a101c542$export$16ea7f650bd7c1bb as useTableSelectionCheckbox, $2a795c53a101c542$export$1003db6a7e384b99 as useTableSelectAllCheckbox};
//# sourceMappingURL=useTableSelectionCheckbox.module.js.map
