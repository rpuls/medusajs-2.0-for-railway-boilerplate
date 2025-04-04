import {useSelectableCollection as $ae20dd8cbca75726$export$d6daf82dcd84e87c} from "./useSelectableCollection.mjs";
import {ListKeyboardDelegate as $2a25aae57d74318e$export$a05409b8bb224a5a} from "./ListKeyboardDelegate.mjs";
import {useCollator as $1aJk5$useCollator} from "@react-aria/i18n";
import {useMemo as $1aJk5$useMemo} from "react";

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



function $982254629710d113$export$b95089534ab7c1fd(props) {
    let { selectionManager: selectionManager, collection: collection, disabledKeys: disabledKeys, ref: ref, keyboardDelegate: keyboardDelegate, layoutDelegate: layoutDelegate } = props;
    // By default, a KeyboardDelegate is provided which uses the DOM to query layout information (e.g. for page up/page down).
    // When virtualized, the layout object will be passed in as a prop and override this.
    let collator = (0, $1aJk5$useCollator)({
        usage: 'search',
        sensitivity: 'base'
    });
    let disabledBehavior = selectionManager.disabledBehavior;
    let delegate = (0, $1aJk5$useMemo)(()=>keyboardDelegate || new (0, $2a25aae57d74318e$export$a05409b8bb224a5a)({
            collection: collection,
            disabledKeys: disabledKeys,
            disabledBehavior: disabledBehavior,
            ref: ref,
            collator: collator,
            layoutDelegate: layoutDelegate
        }), [
        keyboardDelegate,
        layoutDelegate,
        collection,
        disabledKeys,
        ref,
        collator,
        disabledBehavior
    ]);
    let { collectionProps: collectionProps } = (0, $ae20dd8cbca75726$export$d6daf82dcd84e87c)({
        ...props,
        ref: ref,
        selectionManager: selectionManager,
        keyboardDelegate: delegate
    });
    return {
        listProps: collectionProps
    };
}


export {$982254629710d113$export$b95089534ab7c1fd as useSelectableList};
//# sourceMappingURL=useSelectableList.module.js.map
