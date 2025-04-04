import $4AOtR$react, {useContext as $4AOtR$useContext, useState as $4AOtR$useState, useMemo as $4AOtR$useMemo, useEffect as $4AOtR$useEffect} from "react";
import $4AOtR$reactdom from "react-dom";
import {useIsSSR as $4AOtR$useIsSSR} from "@react-aria/ssr";

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


const $f57aed4a881a3485$var$Context = /*#__PURE__*/ (0, $4AOtR$react).createContext(null);
function $f57aed4a881a3485$export$178405afcd8c5eb(props) {
    let { children: children } = props;
    let parent = (0, $4AOtR$useContext)($f57aed4a881a3485$var$Context);
    let [modalCount, setModalCount] = (0, $4AOtR$useState)(0);
    let context = (0, $4AOtR$useMemo)(()=>({
            parent: parent,
            modalCount: modalCount,
            addModal () {
                setModalCount((count)=>count + 1);
                if (parent) parent.addModal();
            },
            removeModal () {
                setModalCount((count)=>count - 1);
                if (parent) parent.removeModal();
            }
        }), [
        parent,
        modalCount
    ]);
    return /*#__PURE__*/ (0, $4AOtR$react).createElement($f57aed4a881a3485$var$Context.Provider, {
        value: context
    }, children);
}
function $f57aed4a881a3485$export$d9aaed4c3ece1bc0() {
    let context = (0, $4AOtR$useContext)($f57aed4a881a3485$var$Context);
    return {
        modalProviderProps: {
            'aria-hidden': context && context.modalCount > 0 ? true : undefined
        }
    };
}
/**
 * Creates a root node that will be aria-hidden if there are other modals open.
 */ function $f57aed4a881a3485$var$OverlayContainerDOM(props) {
    let { modalProviderProps: modalProviderProps } = $f57aed4a881a3485$export$d9aaed4c3ece1bc0();
    return /*#__PURE__*/ (0, $4AOtR$react).createElement("div", {
        "data-overlay-container": true,
        ...props,
        ...modalProviderProps
    });
}
function $f57aed4a881a3485$export$bf688221f59024e5(props) {
    return /*#__PURE__*/ (0, $4AOtR$react).createElement($f57aed4a881a3485$export$178405afcd8c5eb, null, /*#__PURE__*/ (0, $4AOtR$react).createElement($f57aed4a881a3485$var$OverlayContainerDOM, props));
}
function $f57aed4a881a3485$export$b47c3594eab58386(props) {
    let isSSR = (0, $4AOtR$useIsSSR)();
    let { portalContainer: portalContainer = isSSR ? null : document.body, ...rest } = props;
    (0, $4AOtR$react).useEffect(()=>{
        if (portalContainer === null || portalContainer === void 0 ? void 0 : portalContainer.closest('[data-overlay-container]')) throw new Error('An OverlayContainer must not be inside another container. Please change the portalContainer prop.');
    }, [
        portalContainer
    ]);
    if (!portalContainer) return null;
    let contents = /*#__PURE__*/ (0, $4AOtR$react).createElement($f57aed4a881a3485$export$bf688221f59024e5, rest);
    return /*#__PURE__*/ (0, $4AOtR$reactdom).createPortal(contents, portalContainer);
}
function $f57aed4a881a3485$export$33ffd74ebf07f060(options) {
    // Add aria-hidden to all parent providers on mount, and restore on unmount.
    let context = (0, $4AOtR$useContext)($f57aed4a881a3485$var$Context);
    if (!context) throw new Error('Modal is not contained within a provider');
    (0, $4AOtR$useEffect)(()=>{
        if ((options === null || options === void 0 ? void 0 : options.isDisabled) || !context || !context.parent) return;
        // The immediate context is from the provider containing this modal, so we only
        // want to trigger aria-hidden on its parents not on the modal provider itself.
        context.parent.addModal();
        return ()=>{
            if (context && context.parent) context.parent.removeModal();
        };
    }, [
        context,
        context.parent,
        options === null || options === void 0 ? void 0 : options.isDisabled
    ]);
    return {
        modalProps: {
            'data-ismodal': !(options === null || options === void 0 ? void 0 : options.isDisabled)
        }
    };
}


export {$f57aed4a881a3485$export$178405afcd8c5eb as ModalProvider, $f57aed4a881a3485$export$d9aaed4c3ece1bc0 as useModalProvider, $f57aed4a881a3485$export$bf688221f59024e5 as OverlayProvider, $f57aed4a881a3485$export$b47c3594eab58386 as OverlayContainer, $f57aed4a881a3485$export$33ffd74ebf07f060 as useModal};
//# sourceMappingURL=useModal.module.js.map
