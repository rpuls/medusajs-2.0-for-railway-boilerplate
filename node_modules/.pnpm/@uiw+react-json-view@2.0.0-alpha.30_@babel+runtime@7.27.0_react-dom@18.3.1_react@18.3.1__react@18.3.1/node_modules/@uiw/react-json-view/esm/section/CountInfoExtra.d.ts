import { type TagType } from '../store/Types';
import { type SectionElement, type SectionElementProps } from '../store/Section';
export declare const CountInfoExtra: {
    <K extends TagType>(props: SectionElement<K>): null;
    displayName: string;
};
export interface CountInfoExtraCompsProps<T extends object> {
    value?: T;
    keyName: string | number;
}
export declare const CountInfoExtraComps: {
    <T extends object, K extends TagType>(props: SectionElementProps<K> & CountInfoExtraCompsProps<T>): string | number | true | Iterable<import("react").ReactNode> | import("react/jsx-runtime").JSX.Element | null;
    displayName: string;
};
