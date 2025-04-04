var $b2rU6$react = require("react");


function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}

function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "UNSTABLE_PortalProvider", () => $d7347c25ab757295$export$db995ea7163b4b67);
$parcel$export(module.exports, "useUNSTABLE_PortalContext", () => $d7347c25ab757295$export$574e9b0fb070c3b0);
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
const $d7347c25ab757295$export$60d741e20e0aa309 = /*#__PURE__*/ (0, $b2rU6$react.createContext)({});
function $d7347c25ab757295$export$db995ea7163b4b67(props) {
    let { getContainer: getContainer } = props;
    let { getContainer: ctxGetContainer } = $d7347c25ab757295$export$574e9b0fb070c3b0();
    return /*#__PURE__*/ (0, ($parcel$interopDefault($b2rU6$react))).createElement($d7347c25ab757295$export$60d741e20e0aa309.Provider, {
        value: {
            getContainer: getContainer === null ? undefined : getContainer !== null && getContainer !== void 0 ? getContainer : ctxGetContainer
        }
    }, props.children);
}
function $d7347c25ab757295$export$574e9b0fb070c3b0() {
    var _useContext;
    return (_useContext = (0, $b2rU6$react.useContext)($d7347c25ab757295$export$60d741e20e0aa309)) !== null && _useContext !== void 0 ? _useContext : {};
}


//# sourceMappingURL=PortalProvider.main.js.map
