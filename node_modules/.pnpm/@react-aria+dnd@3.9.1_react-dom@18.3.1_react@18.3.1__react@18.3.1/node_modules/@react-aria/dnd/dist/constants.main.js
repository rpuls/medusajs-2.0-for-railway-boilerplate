
function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "DROP_OPERATION", () => $76b1e110a27b1ccd$export$60b7b4bcf3903d8e);
$parcel$export(module.exports, "DROP_OPERATION_ALLOWED", () => $76b1e110a27b1ccd$export$9bbdfc78cf083e16);
$parcel$export(module.exports, "EFFECT_ALLOWED", () => $76b1e110a27b1ccd$export$dd0165308d8bff45);
$parcel$export(module.exports, "DROP_EFFECT_TO_DROP_OPERATION", () => $76b1e110a27b1ccd$export$608ecc6f1b23c35d);
$parcel$export(module.exports, "DROP_OPERATION_TO_DROP_EFFECT", () => $76b1e110a27b1ccd$export$5eacb0769d26d3b2);
$parcel$export(module.exports, "NATIVE_DRAG_TYPES", () => $76b1e110a27b1ccd$export$4a7729b856e9a690);
$parcel$export(module.exports, "CUSTOM_DRAG_TYPE", () => $76b1e110a27b1ccd$export$fd9f9fc120c5402d);
$parcel$export(module.exports, "GENERIC_TYPE", () => $76b1e110a27b1ccd$export$f8fc6581787339b3);
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
 */ var $76b1e110a27b1ccd$export$60b7b4bcf3903d8e = /*#__PURE__*/ function(DROP_OPERATION) {
    DROP_OPERATION[DROP_OPERATION["none"] = 0] = "none";
    DROP_OPERATION[DROP_OPERATION["cancel"] = 0] = "cancel";
    DROP_OPERATION[DROP_OPERATION["move"] = 1] = "move";
    DROP_OPERATION[DROP_OPERATION["copy"] = 2] = "copy";
    DROP_OPERATION[DROP_OPERATION["link"] = 4] = "link";
    DROP_OPERATION[DROP_OPERATION["all"] = 7] = "all";
    return DROP_OPERATION;
}({});
const $76b1e110a27b1ccd$export$9bbdfc78cf083e16 = {
    ...$76b1e110a27b1ccd$export$60b7b4bcf3903d8e,
    copyMove: 3,
    copyLink: 6,
    linkMove: 5,
    all: 7,
    uninitialized: 7
};
const $76b1e110a27b1ccd$export$dd0165308d8bff45 = $76b1e110a27b1ccd$var$invert($76b1e110a27b1ccd$export$9bbdfc78cf083e16);
$76b1e110a27b1ccd$export$dd0165308d8bff45[7] = 'all'; // ensure we don't map to 'uninitialized'.
const $76b1e110a27b1ccd$export$d7ebf00f36b7a95e = $76b1e110a27b1ccd$var$invert($76b1e110a27b1ccd$export$60b7b4bcf3903d8e);
const $76b1e110a27b1ccd$export$608ecc6f1b23c35d = {
    none: 'cancel',
    link: 'link',
    copy: 'copy',
    move: 'move'
};
const $76b1e110a27b1ccd$export$5eacb0769d26d3b2 = $76b1e110a27b1ccd$var$invert($76b1e110a27b1ccd$export$608ecc6f1b23c35d);
function $76b1e110a27b1ccd$var$invert(object) {
    let res = {};
    for(let key in object)res[object[key]] = key;
    return res;
}
const $76b1e110a27b1ccd$export$4a7729b856e9a690 = new Set([
    'text/plain',
    'text/uri-list',
    'text/html'
]);
const $76b1e110a27b1ccd$export$fd9f9fc120c5402d = 'application/vnd.react-aria.items+json';
const $76b1e110a27b1ccd$export$f8fc6581787339b3 = 'application/octet-stream';


//# sourceMappingURL=constants.main.js.map
