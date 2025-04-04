type StateType = [boolean, () => void, () => void, () => void] & {
    state: boolean;
    open: () => void;
    close: () => void;
    toggle: () => void;
};
declare const useToggleState: (initial?: boolean) => StateType;
export { useToggleState };
//# sourceMappingURL=use-toggle-state.d.ts.map