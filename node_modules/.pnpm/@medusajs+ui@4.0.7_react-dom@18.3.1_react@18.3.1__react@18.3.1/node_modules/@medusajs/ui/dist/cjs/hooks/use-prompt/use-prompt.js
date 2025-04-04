"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePrompt = void 0;
const tslib_1 = require("tslib");
const React = tslib_1.__importStar(require("react"));
const react_1 = require("react");
const client_1 = require("react-dom/client");
const render_prompt_1 = require("./render-prompt");
const usePrompt = () => {
    const currentPromptPromise = (0, react_1.useRef)(null);
    const prompt = async (props) => {
        if (currentPromptPromise.current) {
            return currentPromptPromise.current;
        }
        const promptPromise = new Promise((resolve) => {
            let open = true;
            const mountRoot = (0, client_1.createRoot)(document.createElement("div"));
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
                mountRoot.render(React.createElement(render_prompt_1.RenderPrompt, { open: open, onConfirm: onConfirm, onCancel: onCancel, ...props }));
            };
            render();
        });
        currentPromptPromise.current = promptPromise;
        return promptPromise;
    };
    return prompt;
};
exports.usePrompt = usePrompt;
//# sourceMappingURL=use-prompt.js.map