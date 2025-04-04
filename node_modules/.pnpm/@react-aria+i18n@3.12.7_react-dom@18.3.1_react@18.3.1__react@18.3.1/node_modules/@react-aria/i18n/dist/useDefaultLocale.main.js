var $4d65847630a056a8$exports = require("./utils.main.js");
var $5Ie0C$react = require("react");
var $5Ie0C$reactariassr = require("@react-aria/ssr");


function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "useDefaultLocale", () => $2919bdec75484e64$export$188ec29ebc2bdc3a);
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


// Locale passed from server by PackageLocalizationProvider.
const $2919bdec75484e64$var$localeSymbol = Symbol.for('react-aria.i18n.locale');
function $2919bdec75484e64$export$f09106e7c6677ec5() {
    let locale = typeof window !== 'undefined' && window[$2919bdec75484e64$var$localeSymbol] || typeof navigator !== 'undefined' && (navigator.language || navigator.userLanguage) || 'en-US';
    try {
        Intl.DateTimeFormat.supportedLocalesOf([
            locale
        ]);
    } catch  {
        locale = 'en-US';
    }
    return {
        locale: locale,
        direction: (0, $4d65847630a056a8$exports.isRTL)(locale) ? 'rtl' : 'ltr'
    };
}
let $2919bdec75484e64$var$currentLocale = $2919bdec75484e64$export$f09106e7c6677ec5();
let $2919bdec75484e64$var$listeners = new Set();
function $2919bdec75484e64$var$updateLocale() {
    $2919bdec75484e64$var$currentLocale = $2919bdec75484e64$export$f09106e7c6677ec5();
    for (let listener of $2919bdec75484e64$var$listeners)listener($2919bdec75484e64$var$currentLocale);
}
function $2919bdec75484e64$export$188ec29ebc2bdc3a() {
    let isSSR = (0, $5Ie0C$reactariassr.useIsSSR)();
    let [defaultLocale, setDefaultLocale] = (0, $5Ie0C$react.useState)($2919bdec75484e64$var$currentLocale);
    (0, $5Ie0C$react.useEffect)(()=>{
        if ($2919bdec75484e64$var$listeners.size === 0) window.addEventListener('languagechange', $2919bdec75484e64$var$updateLocale);
        $2919bdec75484e64$var$listeners.add(setDefaultLocale);
        return ()=>{
            $2919bdec75484e64$var$listeners.delete(setDefaultLocale);
            if ($2919bdec75484e64$var$listeners.size === 0) window.removeEventListener('languagechange', $2919bdec75484e64$var$updateLocale);
        };
    }, []);
    // We cannot determine the browser's language on the server, so default to
    // en-US. This will be updated after hydration on the client to the correct value.
    if (isSSR) return {
        locale: 'en-US',
        direction: 'ltr'
    };
    return defaultLocale;
}


//# sourceMappingURL=useDefaultLocale.main.js.map
