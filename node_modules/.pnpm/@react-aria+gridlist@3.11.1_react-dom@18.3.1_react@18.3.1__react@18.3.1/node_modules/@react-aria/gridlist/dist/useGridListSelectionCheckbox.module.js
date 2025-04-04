import {getRowId as $ce9b18daab526bbd$export$f45c25170b9a99c2} from "./utils.module.js";
import {useGridSelectionCheckbox as $hdH6v$useGridSelectionCheckbox} from "@react-aria/grid";

/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */ 

function $e52ffc04a4adbd52$export$e29f2573fabbf7b9(props, state) {
    let { key: key } = props;
    const { checkboxProps: checkboxProps } = (0, $hdH6v$useGridSelectionCheckbox)(props, state);
    return {
        checkboxProps: {
            ...checkboxProps,
            'aria-labelledby': `${checkboxProps.id} ${(0, $ce9b18daab526bbd$export$f45c25170b9a99c2)(state, key)}`
        }
    };
}


export {$e52ffc04a4adbd52$export$e29f2573fabbf7b9 as useGridListSelectionCheckbox};
//# sourceMappingURL=useGridListSelectionCheckbox.module.js.map
