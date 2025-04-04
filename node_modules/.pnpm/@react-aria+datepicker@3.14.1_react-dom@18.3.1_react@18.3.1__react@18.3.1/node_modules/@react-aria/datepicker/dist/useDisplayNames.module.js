import $jR5iF$intlStringsmodulejs from "./intlStrings.module.js";
import {useLocale as $jR5iF$useLocale, useLocalizedStringDictionary as $jR5iF$useLocalizedStringDictionary} from "@react-aria/i18n";
import {useMemo as $jR5iF$useMemo} from "react";


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
 */ // @ts-ignore



function $3aeceb3a64eb8358$export$d42c60378c8168f8() {
    let { locale: locale } = (0, $jR5iF$useLocale)();
    let dictionary = (0, $jR5iF$useLocalizedStringDictionary)((0, ($parcel$interopDefault($jR5iF$intlStringsmodulejs))), '@react-aria/datepicker');
    return (0, $jR5iF$useMemo)(()=>{
        // Try to use Intl.DisplayNames if possible. It may be supported in browsers, but not support the dateTimeField
        // type as that was only added in v2. https://github.com/tc39/intl-displaynames-v2
        try {
            return new Intl.DisplayNames(locale, {
                type: 'dateTimeField'
            });
        } catch  {
            return new $3aeceb3a64eb8358$var$DisplayNamesPolyfill(locale, dictionary);
        }
    }, [
        locale,
        dictionary
    ]);
}
class $3aeceb3a64eb8358$var$DisplayNamesPolyfill {
    of(field) {
        return this.dictionary.getStringForLocale(field, this.locale);
    }
    constructor(locale, dictionary){
        this.locale = locale;
        this.dictionary = dictionary;
    }
}


export {$3aeceb3a64eb8358$export$d42c60378c8168f8 as useDisplayNames};
//# sourceMappingURL=useDisplayNames.module.js.map
