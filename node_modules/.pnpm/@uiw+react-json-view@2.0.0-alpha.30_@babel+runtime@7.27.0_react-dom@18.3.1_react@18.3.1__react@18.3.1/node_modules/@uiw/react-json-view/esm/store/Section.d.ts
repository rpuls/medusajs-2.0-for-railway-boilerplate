import React, { FC, PropsWithChildren, ComponentPropsWithoutRef } from 'react';
import { type TagType } from './Types';
export interface SectionElementResult<T extends object, K = string | number> {
    value?: T;
    parentValue?: T;
    keyName?: K;
    /** Index of the parent `keyName` */
    keys?: K[];
}
export type SectionElementProps<T extends TagType = 'span'> = {
    as?: T;
    render?: (props: SectionElement<T>, result: SectionElementResult<object>) => React.ReactNode;
};
export type SectionElement<T extends TagType = 'span'> = SectionElementProps<T> & ComponentPropsWithoutRef<T>;
type InitialState<T extends TagType> = {
    Copied?: SectionElement<T>;
    CountInfo?: SectionElement<T>;
    CountInfoExtra?: SectionElement<T>;
    Ellipsis?: SectionElement<T>;
    Row?: SectionElement<T>;
    KeyName?: SectionElement<T>;
};
type Dispatch = React.Dispatch<InitialState<TagType>>;
export declare const useSectionStore: () => InitialState<TagType>;
export declare function useSection(): [{
    Copied?: SectionElement<TagType> | undefined;
    CountInfo?: SectionElement<TagType> | undefined;
    CountInfoExtra?: SectionElement<TagType> | undefined;
    Ellipsis?: SectionElement<TagType> | undefined;
    Row?: SectionElement<TagType> | undefined;
    KeyName?: SectionElement<TagType> | undefined;
}, React.Dispatch<InitialState<TagType>>];
export declare function useSectionDispatch(): Dispatch;
interface SectionProps {
    initial: InitialState<TagType>;
    dispatch: Dispatch;
}
export declare const Section: FC<PropsWithChildren<SectionProps>>;
export {};
