var $4d65847630a056a8$exports = require("./utils.main.js");
var $2919bdec75484e64$exports = require("./useDefaultLocale.main.js");
var $e7RNT$react = require("react");


function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}

function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "I18nProvider", () => $47fa5ec5ff482271$export$a54013f0d02a8f82);
$parcel$export(module.exports, "useLocale", () => $47fa5ec5ff482271$export$43bb16f9c6d9e3f7);
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


const $47fa5ec5ff482271$var$I18nContext = /*#__PURE__*/ (0, ($parcel$interopDefault($e7RNT$react))).createContext(null);
function $47fa5ec5ff482271$export$a54013f0d02a8f82(props) {
    let { locale: locale, children: children } = props;
    let defaultLocale = (0, $2919bdec75484e64$exports.useDefaultLocale)();
    let value = (0, ($parcel$interopDefault($e7RNT$react))).useMemo(()=>{
        if (!locale) return defaultLocale;
        return {
            locale: locale,
            direction: (0, $4d65847630a056a8$exports.isRTL)(locale) ? 'rtl' : 'ltr'
        };
    }, [
        defaultLocale,
        locale
    ]);
    return /*#__PURE__*/ (0, ($parcel$interopDefault($e7RNT$react))).createElement($47fa5ec5ff482271$var$I18nContext.Provider, {
        value: value
    }, children);
}
function $47fa5ec5ff482271$export$43bb16f9c6d9e3f7() {
    let defaultLocale = (0, $2919bdec75484e64$exports.useDefaultLocale)();
    let context = (0, $e7RNT$react.useContext)($47fa5ec5ff482271$var$I18nContext);
    return context || defaultLocale;
}


//# sourceMappingURL=context.main.js.map
