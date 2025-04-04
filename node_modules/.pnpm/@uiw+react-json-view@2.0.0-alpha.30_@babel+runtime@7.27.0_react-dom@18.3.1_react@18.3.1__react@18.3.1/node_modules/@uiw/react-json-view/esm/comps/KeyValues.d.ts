import { type SectionElementResult } from '../store/Section';
interface KeyValuesProps<T extends object> extends SectionElementResult<T> {
    expandKey?: string;
    level: number;
}
export declare const KeyValues: {
    <T extends object>(props: KeyValuesProps<T>): import("react/jsx-runtime").JSX.Element | null;
    displayName: string;
};
interface KayNameProps<T extends object> extends Omit<KeyValuesProps<T>, 'level'> {
}
export declare const KayName: {
    <T extends object>(props: KayNameProps<T>): import("react/jsx-runtime").JSX.Element;
    displayName: string;
};
export declare const KeyValuesItem: {
    <T extends object>(props: KeyValuesProps<T>): import("react/jsx-runtime").JSX.Element;
    displayName: string;
};
export {};
