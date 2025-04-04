"use client";
import * as React from "react";
import { useRef } from "react";
import { createRoot } from "react-dom/client";
import { RenderPrompt } from "./render-prompt";
const usePrompt = () => {
    const currentPromptPromise = useRef(null);
    const prompt = async (props) => {
        if (currentPromptPromise.current) {
            return currentPromptPromise.current;
        }
        const promptPromise = new Promise((resolve) => {
            let open = true;
            const mountRoot = createRoot(document.createElement("div"));
            const onCancel = () => {
                open = false;
                mountRoot.unmount();
                resolve(false);
                currentPromptPromise.current = null;
                // TEMP FIX for Radix issue with dropdowns persisting pointer-events: none on body after closing
                document.body.style.pointerEvents = "auto";
            };
            const onConfirm = () => {
                open = false;
                resolve(true);
                mountRoot.unmount();
                currentPromptPromise.current = null;
                // TEMP FIX for Radix issue with dropdowns persisting pointer-events: none on body after closing
                document.body.style.pointerEvents = "auto";
            };
            const render = () => {
                mountRoot.render(React.createElement(RenderPrompt, { open: open, onConfirm: onConfirm, onCancel: onCancel, ...props }));
            };
            render();
        });
        currentPromptPromise.current = promptPromise;
        return promptPromise;
    };
    return prompt;
};
export { usePrompt };
//# sourceMappingURL=use-prompt.js.map