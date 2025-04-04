import {flushSync as $eLjnH$flushSync} from "react-dom";
import $eLjnH$react, {useState as $eLjnH$useState, useRef as $eLjnH$useRef, useImperativeHandle as $eLjnH$useImperativeHandle, useEffect as $eLjnH$useEffect} from "react";

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

const $ad0e3f3d9c50e4ba$export$905ab40ac2179daa = /*#__PURE__*/ (0, $eLjnH$react).forwardRef(function DragPreview(props, ref) {
    let render = props.children;
    let [children, setChildren] = (0, $eLjnH$useState)(null);
    let domRef = (0, $eLjnH$useRef)(null);
    let raf = (0, $eLjnH$useRef)(undefined);
    (0, $eLjnH$useImperativeHandle)(ref, ()=>(items, callback)=>{
            // This will be called during the onDragStart event by useDrag. We need to render the
            // preview synchronously before this event returns so we can call event.dataTransfer.setDragImage.
            (0, $eLjnH$flushSync)(()=>{
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
    (0, $eLjnH$useEffect)(()=>{
        return ()=>{
            if (raf.current) cancelAnimationFrame(raf.current);
        };
    }, []);
    if (!children) return null;
    return /*#__PURE__*/ (0, $eLjnH$react).createElement("div", {
        style: {
            zIndex: -100,
            position: 'absolute',
            top: 0,
            left: -100000
        },
        ref: domRef
    }, children);
});


export {$ad0e3f3d9c50e4ba$export$905ab40ac2179daa as DragPreview};
//# sourceMappingURL=DragPreview.module.js.map
