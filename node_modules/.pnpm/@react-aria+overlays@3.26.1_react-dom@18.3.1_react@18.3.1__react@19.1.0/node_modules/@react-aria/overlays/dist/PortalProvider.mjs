import $7yuSY$react, {createContext as $7yuSY$createContext, useContext as $7yuSY$useContext} from "react";

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
const $96b38030c423d352$export$60d741e20e0aa309 = /*#__PURE__*/ (0, $7yuSY$createContext)({});
function $96b38030c423d352$export$db995ea7163b4b67(props) {
    let { getContainer: getContainer } = props;
    let { getContainer: ctxGetContainer } = $96b38030c423d352$export$574e9b0fb070c3b0();
    return /*#__PURE__*/ (0, $7yuSY$react).createElement($96b38030c423d352$export$60d741e20e0aa309.Provider, {
        value: {
            getContainer: getContainer === null ? undefined : getContainer !== null && getContainer !== void 0 ? getContainer : ctxGetContainer
        }
    }, props.children);
}
function $96b38030c423d352$export$574e9b0fb070c3b0() {
    var _useContext;
    return (_useContext = (0, $7yuSY$useContext)($96b38030c423d352$export$60d741e20e0aa309)) !== null && _useContext !== void 0 ? _useContext : {};
}


export {$96b38030c423d352$export$60d741e20e0aa309 as PortalContext, $96b38030c423d352$export$db995ea7163b4b67 as UNSTABLE_PortalProvider, $96b38030c423d352$export$574e9b0fb070c3b0 as useUNSTABLE_PortalContext};
//# sourceMappingURL=PortalProvider.module.js.map
