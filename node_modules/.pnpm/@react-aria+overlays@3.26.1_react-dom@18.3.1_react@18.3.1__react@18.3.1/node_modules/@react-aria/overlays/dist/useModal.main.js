var $btuAB$react = require("react");
var $btuAB$reactdom = require("react-dom");
var $btuAB$reactariassr = require("@react-aria/ssr");


function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}

function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "ModalProvider", () => $0775ea8ea6a0565e$export$178405afcd8c5eb);
$parcel$export(module.exports, "useModalProvider", () => $0775ea8ea6a0565e$export$d9aaed4c3ece1bc0);
$parcel$export(module.exports, "OverlayProvider", () => $0775ea8ea6a0565e$export$bf688221f59024e5);
$parcel$export(module.exports, "OverlayContainer", () => $0775ea8ea6a0565e$export$b47c3594eab58386);
$parcel$export(module.exports, "useModal", () => $0775ea8ea6a0565e$export$33ffd74ebf07f060);
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


const $0775ea8ea6a0565e$var$Context = /*#__PURE__*/ (0, ($parcel$interopDefault($btuAB$react))).createContext(null);
function $0775ea8ea6a0565e$export$178405afcd8c5eb(props) {
    let { children: children } = props;
    let parent = (0, $btuAB$react.useContext)($0775ea8ea6a0565e$var$Context);
    let [modalCount, setModalCount] = (0, $btuAB$react.useState)(0);
    let context = (0, $btuAB$react.useMemo)(()=>({
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
    return /*#__PURE__*/ (0, ($parcel$interopDefault($btuAB$react))).createElement($0775ea8ea6a0565e$var$Context.Provider, {
        value: context
    }, children);
}
function $0775ea8ea6a0565e$export$d9aaed4c3ece1bc0() {
    let context = (0, $btuAB$react.useContext)($0775ea8ea6a0565e$var$Context);
    return {
        modalProviderProps: {
            'aria-hidden': context && context.modalCount > 0 ? true : undefined
        }
    };
}
/**
 * Creates a root node that will be aria-hidden if there are other modals open.
 */ function $0775ea8ea6a0565e$var$OverlayContainerDOM(props) {
    let { modalProviderProps: modalProviderProps } = $0775ea8ea6a0565e$export$d9aaed4c3ece1bc0();
    return /*#__PURE__*/ (0, ($parcel$interopDefault($btuAB$react))).createElement("div", {
        "data-overlay-container": true,
        ...props,
        ...modalProviderProps
    });
}
function $0775ea8ea6a0565e$export$bf688221f59024e5(props) {
    return /*#__PURE__*/ (0, ($parcel$interopDefault($btuAB$react))).createElement($0775ea8ea6a0565e$export$178405afcd8c5eb, null, /*#__PURE__*/ (0, ($parcel$interopDefault($btuAB$react))).createElement($0775ea8ea6a0565e$var$OverlayContainerDOM, props));
}
function $0775ea8ea6a0565e$export$b47c3594eab58386(props) {
    let isSSR = (0, $btuAB$reactariassr.useIsSSR)();
    let { portalContainer: portalContainer = isSSR ? null : document.body, ...rest } = props;
    (0, ($parcel$interopDefault($btuAB$react))).useEffect(()=>{
        if (portalContainer === null || portalContainer === void 0 ? void 0 : portalContainer.closest('[data-overlay-container]')) throw new Error('An OverlayContainer must not be inside another container. Please change the portalContainer prop.');
    }, [
        portalContainer
    ]);
    if (!portalContainer) return null;
    let contents = /*#__PURE__*/ (0, ($parcel$interopDefault($btuAB$react))).createElement($0775ea8ea6a0565e$export$bf688221f59024e5, rest);
    return /*#__PURE__*/ (0, ($parcel$interopDefault($btuAB$reactdom))).createPortal(contents, portalContainer);
}
function $0775ea8ea6a0565e$export$33ffd74ebf07f060(options) {
    // Add aria-hidden to all parent providers on mount, and restore on unmount.
    let context = (0, $btuAB$react.useContext)($0775ea8ea6a0565e$var$Context);
    if (!context) throw new Error('Modal is not contained within a provider');
    (0, $btuAB$react.useEffect)(()=>{
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


//# sourceMappingURL=useModal.main.js.map
