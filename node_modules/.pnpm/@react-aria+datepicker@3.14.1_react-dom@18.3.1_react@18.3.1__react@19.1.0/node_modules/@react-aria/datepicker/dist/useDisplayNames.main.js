var $c1905b78f6d2f5bf$exports = require("./intlStrings.main.js");
var $2nNUW$reactariai18n = require("@react-aria/i18n");
var $2nNUW$react = require("react");


function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}

function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "useDisplayNames", () => $934ac650a0aceb4b$export$d42c60378c8168f8);
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
 */ // @ts-ignore



function $934ac650a0aceb4b$export$d42c60378c8168f8() {
    let { locale: locale } = (0, $2nNUW$reactariai18n.useLocale)();
    let dictionary = (0, $2nNUW$reactariai18n.useLocalizedStringDictionary)((0, ($parcel$interopDefault($c1905b78f6d2f5bf$exports))), '@react-aria/datepicker');
    return (0, $2nNUW$react.useMemo)(()=>{
        // Try to use Intl.DisplayNames if possible. It may be supported in browsers, but not support the dateTimeField
        // type as that was only added in v2. https://github.com/tc39/intl-displaynames-v2
        try {
            return new Intl.DisplayNames(locale, {
                type: 'dateTimeField'
            });
        } catch  {
            return new $934ac650a0aceb4b$var$DisplayNamesPolyfill(locale, dictionary);
        }
    }, [
        locale,
        dictionary
    ]);
}
class $934ac650a0aceb4b$var$DisplayNamesPolyfill {
    of(field) {
        return this.dictionary.getStringForLocale(field, this.locale);
    }
    constructor(locale, dictionary){
        this.locale = locale;
        this.dictionary = dictionary;
    }
}


//# sourceMappingURL=useDisplayNames.main.js.map
