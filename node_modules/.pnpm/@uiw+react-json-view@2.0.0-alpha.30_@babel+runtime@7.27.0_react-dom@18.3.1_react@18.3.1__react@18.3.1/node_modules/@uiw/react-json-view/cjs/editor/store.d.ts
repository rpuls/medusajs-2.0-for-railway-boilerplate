type InitialState = {
    /**
     * When a callback function is passed in, edit functionality is enabled. The callback is invoked before edits are completed.
     * @returns {boolean}  Returning false from onEdit will prevent the change from being made.
     */
    onEdit?: (option: {
        value: unknown;
        oldValue: unknown;
        keyName?: string | number;
        parentName?: string | number;
        type?: 'value' | 'key';
    }) => boolean;
};
type Dispatch = React.Dispatch<InitialState>;
export declare const Context: import("react").Context<InitialState>;
export declare const Dispatch: import("react").Context<Dispatch>;
export declare const useStore: () => InitialState;
export declare function useStoreReducer(initialState: InitialState): [{
    onEdit?: (option: {
        value: unknown;
        oldValue: unknown;
        keyName?: string | number;
        parentName?: string | number;
        type?: "value" | "key";
    }) => boolean;
}, import("react").Dispatch<InitialState>];
export {};
