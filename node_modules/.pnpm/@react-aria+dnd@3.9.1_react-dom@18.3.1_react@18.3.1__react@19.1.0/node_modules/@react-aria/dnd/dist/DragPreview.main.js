var $l6JIF$reactdom = require("react-dom");
var $l6JIF$react = require("react");


function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}

function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "DragPreview", () => $2dccaca1f4baa446$export$905ab40ac2179daa);
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

const $2dccaca1f4baa446$export$905ab40ac2179daa = /*#__PURE__*/ (0, ($parcel$interopDefault($l6JIF$react))).forwardRef(function DragPreview(props, ref) {
    let render = props.children;
    let [children, setChildren] = (0, $l6JIF$react.useState)(null);
    let domRef = (0, $l6JIF$react.useRef)(null);
    let raf = (0, $l6JIF$react.useRef)(undefined);
    (0, $l6JIF$react.useImperativeHandle)(ref, ()=>(items, callback)=>{
            // This will be called during the onDragStart event by useDrag. We need to render the
            // preview synchronously before this event returns so we can call event.dataTransfer.setDragImage.
            (0, $l6JIF$reactdom.flushSync)(()=>{
                setChildren(render(items));
            });
            // Yield back to useDrag to set the drag image.
            callback(domRef.current);
            // Remove the preview from the DOM after a frame so the browser has time to paint.
            raf.current = requestAnimationFrame(()=>{
                setChildren(null);
            });
        }, [
        render
    ]);
    (0, $l6JIF$react.useEffect)(()=>{
        return ()=>{
            if (raf.current) cancelAnimationFrame(raf.current);
        };
    }, []);
    if (!children) return null;
    return /*#__PURE__*/ (0, ($parcel$interopDefault($l6JIF$react))).createElement("div", {
        style: {
            zIndex: -100,
            position: 'absolute',
            top: 0,
            left: -100000
        },
        ref: domRef
    }, children);
});


//# sourceMappingURL=DragPreview.main.js.map
