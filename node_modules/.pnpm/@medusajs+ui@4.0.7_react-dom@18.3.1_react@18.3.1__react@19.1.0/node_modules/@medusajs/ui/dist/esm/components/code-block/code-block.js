"use client";
import { Highlight, Prism, themes } from "prism-react-renderer";
import * as React from "react";
(typeof global !== "undefined" ? global : window).Prism = Prism;
// @ts-ignore
import("prismjs/components/prism-json");
import { Copy } from "../copy";
import { clx } from "../../utils/clx";
const CodeBlockContext = React.createContext(null);
const useCodeBlockContext = () => {
    const context = React.useContext(CodeBlockContext);
    if (context === null)
        throw new Error("useCodeBlockContext can only be used within a CodeBlockContext");
    return context;
};
/**
 * This component is based on the `div` element and supports all of its props
 */
const Root = ({ 
/**
 * The code snippets.
 */
snippets, className, children, ...props }) => {
    const [active, setActive] = React.useState(snippets[0]);
    return (React.createElement(CodeBlockContext.Provider, { value: { snippets, active, setActive } },
        React.createElement("div", { className: clx("bg-ui-contrast-bg-base shadow-elevation-code-block flex flex-col overflow-hidden rounded-xl", className), ...props }, children)));
};
Root.displayName = "CodeBlock";
/**
 * This component is based on the `div` element and supports all of its props
 */
const HeaderComponent = ({ children, className, 
/**
 * Whether to hide the code snippets' labels.
 */
hideLabels = false, ...props }) => {
    const { snippets, active, setActive } = useCodeBlockContext();
    const tabRefs = React.useRef([]);
    const tabIndicatorRef = React.useRef(null);
    React.useEffect(() => {
        const activeTabRef = tabRefs.current.find((ref) => (ref === null || ref === void 0 ? void 0 : ref.dataset.label) === active.label);
        if (activeTabRef && tabIndicatorRef.current) {
            const activeTabIndex = tabRefs.current.indexOf(activeTabRef);
            const prevTabRef = activeTabIndex > 0 ? tabRefs.current[activeTabIndex - 1] : null;
            tabIndicatorRef.current.style.width = `${activeTabRef.offsetWidth}px`;
            tabIndicatorRef.current.style.left = prevTabRef
                ? `${tabRefs.current
                    .slice(0, activeTabIndex)
                    .reduce((total, tab) => total + ((tab === null || tab === void 0 ? void 0 : tab.offsetWidth) || 0) + 12, 0) +
                    15}px`
                : "15px";
        }
    }, [active]);
    return (React.createElement("div", null,
        React.createElement("div", { className: clx("flex items-start px-4 pt-2.5", className), ...props },
            !hideLabels &&
                snippets.map((snippet, idx) => (React.createElement("div", { className: clx("text-ui-contrast-fg-secondary txt-compact-small-plus transition-fg relative cursor-pointer pb-[9px] pr-3", {
                        "text-ui-contrast-fg-primary cursor-default": active.label === snippet.label,
                    }), key: snippet.label, onClick: () => setActive(snippet) },
                    React.createElement("span", { ref: (ref) => {
                            tabRefs.current[idx] = ref;
                            return undefined;
                        }, "data-label": snippet.label }, snippet.label)))),
            children),
        React.createElement("div", { className: "w-full px-0.5" },
            React.createElement("div", { className: "bg-ui-contrast-border-top relative h-px w-full" },
                React.createElement("div", { ref: tabIndicatorRef, className: clx("absolute bottom-0 transition-all motion-reduce:transition-none", "duration-150 ease-linear") },
                    React.createElement("div", { className: "bg-ui-contrast-fg-primary h-px rounded-full" }))))));
};
HeaderComponent.displayName = "CodeBlock.Header";
/**
 * This component is based on the `div` element and supports all of its props
 */
const Meta = ({ className, ...props }) => {
    return (React.createElement("div", { className: clx("txt-compact-small text-ui-contrast-fg-secondary ml-auto", className), ...props }));
};
Meta.displayName = "CodeBlock.Header.Meta";
const Header = Object.assign(HeaderComponent, { Meta });
/**
 * This component is based on the `div` element and supports all of its props
 */
const Body = ({ className, children, ...props }) => {
    const { active } = useCodeBlockContext();
    const showToolbar = children || !active.hideCopy;
    return (React.createElement("div", null,
        showToolbar && (React.createElement("div", { className: "border-ui-contrast-border-bot flex min-h-10 items-center gap-x-3 border-t px-4 py-2" },
            React.createElement("div", { className: "code-body text-ui-contrast-fg-secondary flex-1" }, children),
            !active.hideCopy && (React.createElement(Copy, { content: active.code, className: "text-ui-contrast-fg-secondary" })))),
        React.createElement("div", { className: "flex h-full flex-col overflow-hidden px-[5px] pb-[5px]" },
            React.createElement("div", { className: clx("bg-ui-contrast-bg-subtle border-ui-contrast-border-bot relative h-full overflow-y-auto rounded-lg border p-4", className), ...props },
                React.createElement("div", { className: "max-w-[90%]" },
                    React.createElement(Highlight, { theme: {
                            ...themes.palenight,
                            plain: {
                                color: "rgba(249, 250, 251, 1)",
                                backgroundColor: "var(--contrast-fg-primary)",
                            },
                            styles: [
                                ...themes.palenight.styles,
                                {
                                    types: ["keyword"],
                                    style: {
                                        fontStyle: "normal",
                                        color: "rgb(187,160,255)",
                                    },
                                },
                                {
                                    types: ["punctuation", "operator"],
                                    style: {
                                        fontStyle: "normal",
                                        color: "rgb(255,255,255)",
                                    },
                                },
                                {
                                    types: ["constant", "boolean"],
                                    style: {
                                        fontStyle: "normal",
                                        color: "rgb(187,77,96)",
                                    },
                                },
                                {
                                    types: ["function"],
                                    style: {
                                        fontStyle: "normal",
                                        color: "rgb(27,198,242)",
                                    },
                                },
                                {
                                    types: ["number"],
                                    style: {
                                        color: "rgb(247,208,25)",
                                    },
                                },
                                {
                                    types: ["property"],
                                    style: {
                                        color: "rgb(247,208,25)",
                                    },
                                },
                                {
                                    types: ["maybe-class-name"],
                                    style: {
                                        color: "rgb(255,203,107)",
                                    },
                                },
                                {
                                    types: ["string"],
                                    style: {
                                        color: "rgb(73,209,110)",
                                    },
                                },
                                {
                                    types: ["comment"],
                                    style: {
                                        color: "var(--contrast-fg-secondary)",
                                        fontStyle: "normal",
                                    },
                                },
                            ],
                        }, code: active.code, language: active.language }, ({ style, tokens, getLineProps, getTokenProps }) => (React.createElement("pre", { className: clx("code-body whitespace-pre-wrap bg-transparent", {
                            "grid grid-cols-[auto,1fr] gap-x-4": !active.hideLineNumbers,
                        }), style: {
                            ...style,
                            background: "transparent",
                        } },
                        !active.hideLineNumbers && (React.createElement("div", { role: "presentation", className: "flex flex-col text-right" }, tokens.map((_, i) => (React.createElement("span", { key: i, className: "text-ui-contrast-fg-secondary tabular-nums" }, i + 1))))),
                        React.createElement("div", null, tokens.map((line, i) => (React.createElement("div", { key: i, ...getLineProps({ line }) }, line.map((token, key) => (React.createElement("span", { key: key, ...getTokenProps({ token }) })))))))))))))));
};
Body.displayName = "CodeBlock.Body";
const CodeBlock = Object.assign(Root, { Body, Header, Meta });
export { CodeBlock };
//# sourceMappingURL=code-block.js.map