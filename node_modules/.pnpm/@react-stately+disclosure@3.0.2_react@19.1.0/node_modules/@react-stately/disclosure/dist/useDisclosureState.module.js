import {useCallback as $acGV5$useCallback} from "react";
import {useControlledState as $acGV5$useControlledState} from "@react-stately/utils";

/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */ 

function $bf996d45f4a36925$export$3fcbf6e4407997e0(props) {
    let [isExpanded, setExpanded] = (0, $acGV5$useControlledState)(props.isExpanded, props.defaultExpanded || false, props.onExpandedChange);
    const expand = (0, $acGV5$useCallback)(()=>{
        setExpanded(true);
    }, [
        setExpanded
    ]);
    const collapse = (0, $acGV5$useCallback)(()=>{
        setExpanded(false);
    }, [
        setExpanded
    ]);
    const toggle = (0, $acGV5$useCallback)(()=>{
        setExpanded(!isExpanded);
    }, [
        setExpanded,
        isExpanded
    ]);
    return {
        isExpanded: isExpanded,
        setExpanded: setExpanded,
        expand: expand,
        collapse: collapse,
        toggle: toggle
    };
}


export {$bf996d45f4a36925$export$3fcbf6e4407997e0 as useDisclosureState};
//# sourceMappingURL=useDisclosureState.module.js.map
