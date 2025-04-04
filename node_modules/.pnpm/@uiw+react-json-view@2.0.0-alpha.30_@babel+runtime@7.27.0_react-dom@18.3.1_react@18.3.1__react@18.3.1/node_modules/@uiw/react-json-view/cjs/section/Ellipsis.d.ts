import { type TagType } from '../store/Types';
import { type SectionElement } from '../store/Section';
export declare const Ellipsis: {
    <K extends TagType>(props: SectionElement<K>): null;
    displayName: string;
};
export interface EllipsisCompProps<T extends object> {
    value?: T;
    keyName: string | number;
    isExpanded: boolean;
}
export declare const EllipsisComp: {
    <T extends object>({ isExpanded, value, keyName }: EllipsisCompProps<T>): string | number | true | Iterable<import("react").ReactNode> | import("react/jsx-runtime").JSX.Element | null;
    displayName: string;
};
