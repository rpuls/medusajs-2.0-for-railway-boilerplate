var $5935ba4d7da2c103$exports = require("./calculatePosition.main.js");
var $9a8aa1b0b336ea3a$exports = require("./useCloseOnScroll.main.js");
var $6TXnl$react = require("react");
var $6TXnl$reactariautils = require("@react-aria/utils");
var $6TXnl$reactariai18n = require("@react-aria/i18n");


function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "useOverlayPosition", () => $cd94b4896dd97759$export$d39e1813b3bdd0e1);
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




let $cd94b4896dd97759$var$visualViewport = typeof document !== 'undefined' ? window.visualViewport : null;
function $cd94b4896dd97759$export$d39e1813b3bdd0e1(props) {
    let { direction: direction } = (0, $6TXnl$reactariai18n.useLocale)();
    let { arrowSize: arrowSize = 0, targetRef: targetRef, overlayRef: overlayRef, scrollRef: scrollRef = overlayRef, placement: placement = 'bottom', containerPadding: containerPadding = 12, shouldFlip: shouldFlip = true, boundaryElement: boundaryElement = typeof document !== 'undefined' ? document.body : null, offset: offset = 0, crossOffset: crossOffset = 0, shouldUpdatePosition: shouldUpdatePosition = true, isOpen: isOpen = true, onClose: onClose, maxHeight: maxHeight, arrowBoundaryOffset: arrowBoundaryOffset = 0 } = props;
    let [position, setPosition] = (0, $6TXnl$react.useState)(null);
    let deps = [
        shouldUpdatePosition,
        placement,
        overlayRef.current,
        targetRef.current,
        scrollRef.current,
        containerPadding,
        shouldFlip,
        boundaryElement,
        offset,
        crossOffset,
        isOpen,
        direction,
        maxHeight,
        arrowBoundaryOffset,
        arrowSize
    ];
    // Note, the position freezing breaks if body sizes itself dynamicly with the visual viewport but that might
    // just be a non-realistic use case
    // Upon opening a overlay, record the current visual viewport scale so we can freeze the overlay styles
    let lastScale = (0, $6TXnl$react.useRef)($cd94b4896dd97759$var$visualViewport === null || $cd94b4896dd97759$var$visualViewport === void 0 ? void 0 : $cd94b4896dd97759$var$visualViewport.scale);
    (0, $6TXnl$react.useEffect)(()=>{
        if (isOpen) lastScale.current = $cd94b4896dd97759$var$visualViewport === null || $cd94b4896dd97759$var$visualViewport === void 0 ? void 0 : $cd94b4896dd97759$var$visualViewport.scale;
    }, [
        isOpen
    ]);
    let updatePosition = (0, $6TXnl$react.useCallback)(()=>{
        if (shouldUpdatePosition === false || !isOpen || !overlayRef.current || !targetRef.current || !boundaryElement) return;
        if (($cd94b4896dd97759$var$visualViewport === null || $cd94b4896dd97759$var$visualViewport === void 0 ? void 0 : $cd94b4896dd97759$var$visualViewport.scale) !== lastScale.current) return;
        // Determine a scroll anchor based on the focused element.
        // This stores the offset of the anchor element from the scroll container
        // so it can be restored after repositioning. This way if the overlay height
        // changes, the focused element appears to stay in the same position.
        let anchor = null;
        if (scrollRef.current && scrollRef.current.contains(document.activeElement)) {
            var _document_activeElement;
            let anchorRect = (_document_activeElement = document.activeElement) === null || _document_activeElement === void 0 ? void 0 : _document_activeElement.getBoundingClientRect();
            let scrollRect = scrollRef.current.getBoundingClientRect();
            var _anchorRect_top;
            // Anchor from the top if the offset is in the top half of the scrollable element,
            // otherwise anchor from the bottom.
            anchor = {
                type: 'top',
                offset: ((_anchorRect_top = anchorRect === null || anchorRect === void 0 ? void 0 : anchorRect.top) !== null && _anchorRect_top !== void 0 ? _anchorRect_top : 0) - scrollRect.top
            };
            if (anchor.offset > scrollRect.height / 2) {
                anchor.type = 'bottom';
                var _anchorRect_bottom;
                anchor.offset = ((_anchorRect_bottom = anchorRect === null || anchorRect === void 0 ? void 0 : anchorRect.bottom) !== null && _anchorRect_bottom !== void 0 ? _anchorRect_bottom : 0) - scrollRect.bottom;
            }
        }
        // Always reset the overlay's previous max height if not defined by the user so that we can compensate for
        // RAC collections populating after a second render and properly set a correct max height + positioning when it populates.
        let overlay = overlayRef.current;
        if (!maxHeight && overlayRef.current) {
            var _window_visualViewport;
            overlay.style.top = '0px';
            overlay.style.bottom = '';
            var _window_visualViewport_height;
            overlay.style.maxHeight = ((_window_visualViewport_height = (_window_visualViewport = window.visualViewport) === null || _window_visualViewport === void 0 ? void 0 : _window_visualViewport.height) !== null && _window_visualViewport_height !== void 0 ? _window_visualViewport_height : window.innerHeight) + 'px';
        }
        let position = (0, $5935ba4d7da2c103$exports.calculatePosition)({
            placement: $cd94b4896dd97759$var$translateRTL(placement, direction),
            overlayNode: overlayRef.current,
            targetNode: targetRef.current,
            scrollNode: scrollRef.current || overlayRef.current,
            padding: containerPadding,
            shouldFlip: shouldFlip,
            boundaryElement: boundaryElement,
            offset: offset,
            crossOffset: crossOffset,
            maxHeight: maxHeight,
            arrowSize: arrowSize,
            arrowBoundaryOffset: arrowBoundaryOffset
        });
        if (!position.position) return;
        // Modify overlay styles directly so positioning happens immediately without the need of a second render
        // This is so we don't have to delay autoFocus scrolling or delay applying preventScroll for popovers
        overlay.style.top = '';
        overlay.style.bottom = '';
        overlay.style.left = '';
        overlay.style.right = '';
        Object.keys(position.position).forEach((key)=>overlay.style[key] = position.position[key] + 'px');
        overlay.style.maxHeight = position.maxHeight != null ? position.maxHeight + 'px' : '';
        // Restore scroll position relative to anchor element.
        if (anchor && document.activeElement && scrollRef.current) {
            let anchorRect = document.activeElement.getBoundingClientRect();
            let scrollRect = scrollRef.current.getBoundingClientRect();
            let newOffset = anchorRect[anchor.type] - scrollRect[anchor.type];
            scrollRef.current.scrollTop += newOffset - anchor.offset;
        }
        // Trigger a set state for a second render anyway for arrow positioning
        setPosition(position);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
    // Update position when anything changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    (0, $6TXnl$reactariautils.useLayoutEffect)(updatePosition, deps);
    // Update position on window resize
    $cd94b4896dd97759$var$useResize(updatePosition);
    // Update position when the overlay changes size (might need to flip).
    (0, $6TXnl$reactariautils.useResizeObserver)({
        ref: overlayRef,
        onResize: updatePosition
    });
    // Update position when the target changes size (might need to flip).
    (0, $6TXnl$reactariautils.useResizeObserver)({
        ref: targetRef,
        onResize: updatePosition
    });
    // Reposition the overlay and do not close on scroll while the visual viewport is resizing.
    // This will ensure that overlays adjust their positioning when the iOS virtual keyboard appears.
    let isResizing = (0, $6TXnl$react.useRef)(false);
    (0, $6TXnl$reactariautils.useLayoutEffect)(()=>{
        let timeout;
        let onResize = ()=>{
            isResizing.current = true;
            clearTimeout(timeout);
            timeout = setTimeout(()=>{
                isResizing.current = false;
            }, 500);
            updatePosition();
        };
        // Only reposition the overlay if a scroll event happens immediately as a result of resize (aka the virtual keyboard has appears)
        // We don't want to reposition the overlay if the user has pinch zoomed in and is scrolling the viewport around.
        let onScroll = ()=>{
            if (isResizing.current) onResize();
        };
        $cd94b4896dd97759$var$visualViewport === null || $cd94b4896dd97759$var$visualViewport === void 0 ? void 0 : $cd94b4896dd97759$var$visualViewport.addEventListener('resize', onResize);
        $cd94b4896dd97759$var$visualViewport === null || $cd94b4896dd97759$var$visualViewport === void 0 ? void 0 : $cd94b4896dd97759$var$visualViewport.addEventListener('scroll', onScroll);
        return ()=>{
            $cd94b4896dd97759$var$visualViewport === null || $cd94b4896dd97759$var$visualViewport === void 0 ? void 0 : $cd94b4896dd97759$var$visualViewport.removeEventListener('resize', onResize);
            $cd94b4896dd97759$var$visualViewport === null || $cd94b4896dd97759$var$visualViewport === void 0 ? void 0 : $cd94b4896dd97759$var$visualViewport.removeEventListener('scroll', onScroll);
        };
    }, [
        updatePosition
    ]);
    let close = (0, $6TXnl$react.useCallback)(()=>{
        if (!isResizing.current) onClose === null || onClose === void 0 ? void 0 : onClose();
    }, [
        onClose,
        isResizing
    ]);
    // When scrolling a parent scrollable region of the trigger (other than the body),
    // we hide the popover. Otherwise, its position would be incorrect.
    (0, $9a8aa1b0b336ea3a$exports.useCloseOnScroll)({
        triggerRef: targetRef,
        isOpen: isOpen,
        onClose: onClose && close
    });
    var _position_maxHeight, _position_placement;
    return {
        overlayProps: {
            style: {
                position: 'absolute',
                zIndex: 100000,
                ...position === null || position === void 0 ? void 0 : position.position,
                maxHeight: (_position_maxHeight = position === null || position === void 0 ? void 0 : position.maxHeight) !== null && _position_maxHeight !== void 0 ? _position_maxHeight : '100vh'
            }
        },
        placement: (_position_placement = position === null || position === void 0 ? void 0 : position.placement) !== null && _position_placement !== void 0 ? _position_placement : null,
        arrowProps: {
            'aria-hidden': 'true',
            role: 'presentation',
            style: {
                left: position === null || position === void 0 ? void 0 : position.arrowOffsetLeft,
                top: position === null || position === void 0 ? void 0 : position.arrowOffsetTop
            }
        },
        updatePosition: updatePosition
    };
}
function $cd94b4896dd97759$var$useResize(onResize) {
    (0, $6TXnl$reactariautils.useLayoutEffect)(()=>{
        window.addEventListener('resize', onResize, false);
        return ()=>{
            window.removeEventListener('resize', onResize, false);
        };
    }, [
        onResize
    ]);
}
function $cd94b4896dd97759$var$translateRTL(position, direction) {
    if (direction === 'rtl') return position.replace('start', 'right').replace('end', 'left');
    return position.replace('start', 'left').replace('end', 'right');
}


//# sourceMappingURL=useOverlayPosition.main.js.map
