var $47fa5ec5ff482271$exports = require("./context.main.js");
var $1NItU$internationalizednumber = require("@internationalized/number");
var $1NItU$react = require("react");


function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "useNumberFormatter", () => $fea93c5b7c90d9f4$export$b7a616150fdb9f44);
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


function $fea93c5b7c90d9f4$export$b7a616150fdb9f44(options = {}) {
    let { locale: locale } = (0, $47fa5ec5ff482271$exports.useLocale)();
    return (0, $1NItU$react.useMemo)(()=>new (0, $1NItU$internationalizednumber.NumberFormatter)(locale, options), [
        locale,
        options
    ]);
}


//# sourceMappingURL=useNumberFormatter.main.js.map
