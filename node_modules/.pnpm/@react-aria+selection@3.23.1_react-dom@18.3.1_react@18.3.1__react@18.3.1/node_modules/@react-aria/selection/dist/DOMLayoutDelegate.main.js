var $ee0bdf4faa47f2a8$exports = require("./utils.main.js");


function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "DOMLayoutDelegate", () => $2ac4508142683dcb$export$8f5ed9ff9f511381);
/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */ 
class $2ac4508142683dcb$export$8f5ed9ff9f511381 {
    getItemRect(key) {
        let container = this.ref.current;
        if (!container) return null;
        let item = key != null ? (0, $ee0bdf4faa47f2a8$exports.getItemElement)(this.ref, key) : null;
        if (!item) return null;
        let containerRect = container.getBoundingClientRect();
        let itemRect = item.getBoundingClientRect();
        return {
            x: itemRect.left - containerRect.left + container.scrollLeft,
            y: itemRect.top - containerRect.top + container.scrollTop,
            width: itemRect.width,
            height: itemRect.height
        };
    }
    getContentSize() {
        let container = this.ref.current;
        var _container_scrollWidth, _container_scrollHeight;
        return {
            width: (_container_scrollWidth = container === null || container === void 0 ? void 0 : container.scrollWidth) !== null && _container_scrollWidth !== void 0 ? _container_scrollWidth : 0,
            height: (_container_scrollHeight = container === null || container === void 0 ? void 0 : container.scrollHeight) !== null && _container_scrollHeight !== void 0 ? _container_scrollHeight : 0
        };
    }
    getVisibleRect() {
        let container = this.ref.current;
        var _container_scrollLeft, _container_scrollTop, _container_offsetWidth, _container_offsetHeight;
        return {
            x: (_container_scrollLeft = container === null || container === void 0 ? void 0 : container.scrollLeft) !== null && _container_scrollLeft !== void 0 ? _container_scrollLeft : 0,
            y: (_container_scrollTop = container === null || container === void 0 ? void 0 : container.scrollTop) !== null && _container_scrollTop !== void 0 ? _container_scrollTop : 0,
            width: (_container_offsetWidth = container === null || container === void 0 ? void 0 : container.offsetWidth) !== null && _container_offsetWidth !== void 0 ? _container_offsetWidth : 0,
            height: (_container_offsetHeight = container === null || container === void 0 ? void 0 : container.offsetHeight) !== null && _container_offsetHeight !== void 0 ? _container_offsetHeight : 0
        };
    }
    constructor(ref){
        this.ref = ref;
    }
}


//# sourceMappingURL=DOMLayoutDelegate.main.js.map
