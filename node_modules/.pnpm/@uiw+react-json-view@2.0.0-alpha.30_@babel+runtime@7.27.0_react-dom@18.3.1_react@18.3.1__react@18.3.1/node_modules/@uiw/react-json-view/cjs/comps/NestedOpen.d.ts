import { type SectionElementResult } from '../store/Section';
export interface NestedOpenProps<T extends object> extends SectionElementResult<T> {
    initialValue?: T;
    expandKey: string;
    level: number;
}
export declare const NestedOpen: {
    <T extends object>(props: NestedOpenProps<T>): import("react/jsx-runtime").JSX.Element;
    displayName: string;
};
