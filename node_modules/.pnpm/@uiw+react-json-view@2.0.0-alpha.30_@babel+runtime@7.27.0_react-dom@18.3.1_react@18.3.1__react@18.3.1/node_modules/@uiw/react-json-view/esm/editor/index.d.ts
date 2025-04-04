import { type JsonViewProps } from '../';
export interface JsonViewEditorProps<T extends object> extends Omit<JsonViewProps<T>, 'shortenTextAfterLength'> {
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
    /** Whether enable edit feature. @default true */
    editable?: boolean;
}
declare const JsonViewEditor: import("react").ForwardRefExoticComponent<Omit<JsonViewEditorProps<object>, "ref"> & import("react").RefAttributes<HTMLDivElement>>;
export default JsonViewEditor;
