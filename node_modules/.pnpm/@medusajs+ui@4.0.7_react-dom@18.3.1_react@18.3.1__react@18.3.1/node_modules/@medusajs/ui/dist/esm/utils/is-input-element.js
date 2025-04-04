const isInputElement = (element) => {
    return (element instanceof HTMLElement &&
        (element.isContentEditable ||
            element.tagName === "INPUT" ||
            element.tagName === "TEXTAREA" ||
            element.tagName === "SELECT"));
};
export { isInputElement };
//# sourceMappingURL=is-input-element.js.map