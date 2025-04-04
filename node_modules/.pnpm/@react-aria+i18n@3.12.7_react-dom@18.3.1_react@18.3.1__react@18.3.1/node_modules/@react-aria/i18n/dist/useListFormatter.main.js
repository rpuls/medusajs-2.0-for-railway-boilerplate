var $47fa5ec5ff482271$exports = require("./context.main.js");
var $3UK6J$react = require("react");


function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "useListFormatter", () => $cb6a3e7d490e97a4$export$a2f47a3d2973640);
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

function $cb6a3e7d490e97a4$export$a2f47a3d2973640(options = {}) {
    let { locale: locale } = (0, $47fa5ec5ff482271$exports.useLocale)();
    return (0, $3UK6J$react.useMemo)(()=>new Intl.ListFormat(locale, options), [
        locale,
        options
    ]);
}


//# sourceMappingURL=useListFormatter.main.js.map
