var $51588fd411aace25$exports = require("./CollectionBuilder.main.js");
var $bSehf$react = require("react");


function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "useCollection", () => $98fc0fafaca75b6a$export$6cd28814d92fa9c9);
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

function $98fc0fafaca75b6a$export$6cd28814d92fa9c9(props, factory, context) {
    let builder = (0, $bSehf$react.useMemo)(()=>new (0, $51588fd411aace25$exports.CollectionBuilder)(), []);
    let { children: children, items: items, collection: collection } = props;
    let result = (0, $bSehf$react.useMemo)(()=>{
        if (collection) return collection;
        let nodes = builder.build({
            children: children,
            items: items
        }, context);
        return factory(nodes);
    }, [
        builder,
        children,
        items,
        collection,
        context,
        factory
    ]);
    return result;
}


//# sourceMappingURL=useCollection.main.js.map
