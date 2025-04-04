import { type PropsWithChildren } from 'react';
import { type TagType } from '../store/Types';
import { type SectionElement } from '../store/Section';
import { type SectionElementResult } from '../store/Section';
export declare const KeyName: {
    <K extends TagType>(props: SectionElement<K>): null;
    displayName: string;
};
export interface KeyNameCompProps<T extends object> extends React.HTMLAttributes<HTMLSpanElement>, SectionElementResult<T> {
}
export declare const KeyNameComp: {
    <T extends object>(props: PropsWithChildren<KeyNameCompProps<T>>): string | number | true | Iterable<import("react").ReactNode> | import("react/jsx-runtime").JSX.Element;
    displayName: string;
};
