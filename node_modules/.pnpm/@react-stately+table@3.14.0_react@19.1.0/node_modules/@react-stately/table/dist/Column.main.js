var $kykIu$react = require("react");


function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}

function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "Column", () => $714483d9f6ca4c55$export$816b5d811295e6bc);
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
function $714483d9f6ca4c55$var$Column(props) {
    return null;
}
$714483d9f6ca4c55$var$Column.getCollectionNode = function* getCollectionNode(props, context) {
    let { title: title, children: children, childColumns: childColumns } = props;
    let rendered = title || children;
    let textValue = props.textValue || (typeof rendered === 'string' ? rendered : '') || props['aria-label'];
    let fullNodes = yield {
        type: 'column',
        hasChildNodes: !!childColumns || !!title && (0, ($parcel$interopDefault($kykIu$react))).Children.count(children) > 0,
        rendered: rendered,
        textValue: textValue,
        props: props,
        *childNodes () {
            if (childColumns) for (let child of childColumns)yield {
                type: 'column',
                value: child
            };
            else if (title) {
                let childColumns = [];
                (0, ($parcel$interopDefault($kykIu$react))).Children.forEach(children, (child)=>{
                    childColumns.push({
                        type: 'column',
                        element: child
                    });
                });
                yield* childColumns;
            }
        },
        shouldInvalidate (newContext) {
            // This is a bit of a hack, but it works.
            // If this method is called, then there's a cached version of this node available.
            // But, we need to keep the list of columns in the new context up to date.
            updateContext(newContext);
            return false;
        }
    };
    let updateContext = (context)=>{
        // register leaf columns on the context so that <Row> can access them
        for (let node of fullNodes)if (!node.hasChildNodes) context.columns.push(node);
    };
    updateContext(context);
};
/**
 * A Column represents a field of each item within a Table. Columns may also contain nested
 * Column elements to represent column groups. Nested columns can be statically defined as
 * children, or dynamically generated using a function based on the `childColumns` prop.
 */ // We don't want getCollectionNode to show up in the type definition
let $714483d9f6ca4c55$export$816b5d811295e6bc = $714483d9f6ca4c55$var$Column;


//# sourceMappingURL=Column.main.js.map
