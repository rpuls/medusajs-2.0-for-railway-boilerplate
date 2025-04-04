import {useLocale as $18f2051aff69b9bf$export$43bb16f9c6d9e3f7} from "./context.mjs";
import {MessageDictionary as $eZWU1$MessageDictionary, MessageFormatter as $eZWU1$MessageFormatter} from "@internationalized/message";
import {useMemo as $eZWU1$useMemo, useCallback as $eZWU1$useCallback} from "react";

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


const $321bc95feeb923dd$var$cache = new WeakMap();
function $321bc95feeb923dd$var$getCachedDictionary(strings) {
    let dictionary = $321bc95feeb923dd$var$cache.get(strings);
    if (!dictionary) {
        dictionary = new (0, $eZWU1$MessageDictionary)(strings);
        $321bc95feeb923dd$var$cache.set(strings, dictionary);
    }
    return dictionary;
}
function $321bc95feeb923dd$export$ec23bf898b1eed85(strings) {
    let { locale: locale } = (0, $18f2051aff69b9bf$export$43bb16f9c6d9e3f7)();
    let dictionary = (0, $eZWU1$useMemo)(()=>$321bc95feeb923dd$var$getCachedDictionary(strings), [
        strings
    ]);
    let formatter = (0, $eZWU1$useMemo)(()=>new (0, $eZWU1$MessageFormatter)(locale, dictionary), [
        locale,
        dictionary
    ]);
    return (0, $eZWU1$useCallback)((key, variables)=>formatter.format(key, variables), [
        formatter
    ]);
}


export {$321bc95feeb923dd$export$ec23bf898b1eed85 as useMessageFormatter};
//# sourceMappingURL=useMessageFormatter.module.js.map
