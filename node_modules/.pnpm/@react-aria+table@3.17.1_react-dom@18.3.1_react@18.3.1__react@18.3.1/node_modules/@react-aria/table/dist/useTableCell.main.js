var $6acf696f746f932c$exports = require("./utils.main.js");
var $8iEv8$reactariagrid = require("@react-aria/grid");


function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "useTableCell", () => $32387a1f2c61cda2$export$49571c903d73624c);
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

function $32387a1f2c61cda2$export$49571c903d73624c(props, state, ref) {
    var _props_node_column;
    let { gridCellProps: gridCellProps, isPressed: isPressed } = (0, $8iEv8$reactariagrid.useGridCell)(props, state, ref);
    let columnKey = (_props_node_column = props.node.column) === null || _props_node_column === void 0 ? void 0 : _props_node_column.key;
    if (columnKey != null && state.collection.rowHeaderColumnKeys.has(columnKey)) {
        gridCellProps.role = 'rowheader';
        gridCellProps.id = (0, $6acf696f746f932c$exports.getCellId)(state, props.node.parentKey, columnKey);
    }
    return {
        gridCellProps: gridCellProps,
        isPressed: isPressed
    };
}


//# sourceMappingURL=useTableCell.main.js.map
