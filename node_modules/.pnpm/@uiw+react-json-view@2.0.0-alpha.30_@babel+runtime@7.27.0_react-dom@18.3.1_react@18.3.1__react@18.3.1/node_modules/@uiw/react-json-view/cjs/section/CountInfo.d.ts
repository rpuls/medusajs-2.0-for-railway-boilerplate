import { type TagType } from '../store/Types';
import { type SectionElement, type SectionElementProps } from '../store/Section';
export declare const CountInfo: {
    <K extends TagType>(props: SectionElement<K>): null;
    displayName: string;
};
export interface CountInfoCompProps<T extends object> {
    value?: T;
    keyName: string | number;
}
export declare const CountInfoComp: {
    <K extends TagType, T extends object>(props: SectionElementProps<K> & CountInfoCompProps<T> & React.HTMLAttributes<HTMLElement>): string | number | true | Iterable<import("react").ReactNode> | import("react/jsx-runtime").JSX.Element | null;
    displayName: string;
};
