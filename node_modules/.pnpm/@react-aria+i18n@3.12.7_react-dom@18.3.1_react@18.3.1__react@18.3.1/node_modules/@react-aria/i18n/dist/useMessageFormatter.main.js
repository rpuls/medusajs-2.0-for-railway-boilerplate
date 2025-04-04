var $47fa5ec5ff482271$exports = require("./context.main.js");
var $8WbGG$internationalizedmessage = require("@internationalized/message");
var $8WbGG$react = require("react");


function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "useMessageFormatter", () => $c376aa482226bf60$export$ec23bf898b1eed85);
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


const $c376aa482226bf60$var$cache = new WeakMap();
function $c376aa482226bf60$var$getCachedDictionary(strings) {
    let dictionary = $c376aa482226bf60$var$cache.get(strings);
    if (!dictionary) {
        dictionary = new (0, $8WbGG$internationalizedmessage.MessageDictionary)(strings);
        $c376aa482226bf60$var$cache.set(strings, dictionary);
    }
    return dictionary;
}
function $c376aa482226bf60$export$ec23bf898b1eed85(strings) {
    let { locale: locale } = (0, $47fa5ec5ff482271$exports.useLocale)();
    let dictionary = (0, $8WbGG$react.useMemo)(()=>$c376aa482226bf60$var$getCachedDictionary(strings), [
        strings
    ]);
    let formatter = (0, $8WbGG$react.useMemo)(()=>new (0, $8WbGG$internationalizedmessage.MessageFormatter)(locale, dictionary), [
        locale,
        dictionary
    ]);
    return (0, $8WbGG$react.useCallback)((key, variables)=>formatter.format(key, variables), [
        formatter
    ]);
}


//# sourceMappingURL=useMessageFormatter.main.js.map
