var $6acf696f746f932c$exports = require("./utils.main.js");
var $7ff3f66df3873a5e$exports = require("./intlStrings.main.js");
var $jX14I$reactariagrid = require("@react-aria/grid");
var $jX14I$reactariai18n = require("@react-aria/i18n");


function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}

function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "useTableSelectionCheckbox", () => $0b394e4562ac57c9$export$16ea7f650bd7c1bb);
$parcel$export(module.exports, "useTableSelectAllCheckbox", () => $0b394e4562ac57c9$export$1003db6a7e384b99);
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



function $0b394e4562ac57c9$export$16ea7f650bd7c1bb(props, state) {
    let { key: key } = props;
    const { checkboxProps: checkboxProps } = (0, $jX14I$reactariagrid.useGridSelectionCheckbox)(props, state);
    return {
        checkboxProps: {
            ...checkboxProps,
            'aria-labelledby': `${checkboxProps.id} ${(0, $6acf696f746f932c$exports.getRowLabelledBy)(state, key)}`
        }
    };
}
function $0b394e4562ac57c9$export$1003db6a7e384b99(state) {
    let { isEmpty: isEmpty, isSelectAll: isSelectAll, selectionMode: selectionMode } = state.selectionManager;
    const stringFormatter = (0, $jX14I$reactariai18n.useLocalizedStringFormatter)((0, ($parcel$interopDefault($7ff3f66df3873a5e$exports))), '@react-aria/table');
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


//# sourceMappingURL=useTableSelectionCheckbox.main.js.map
