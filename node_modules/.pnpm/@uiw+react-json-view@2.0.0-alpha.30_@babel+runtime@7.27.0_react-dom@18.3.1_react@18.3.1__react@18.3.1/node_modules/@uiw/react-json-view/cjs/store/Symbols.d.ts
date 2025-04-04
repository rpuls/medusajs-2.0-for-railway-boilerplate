import { FC, PropsWithChildren, ElementType, ComponentPropsWithoutRef } from 'react';
import { type TagType } from './Types';
export interface SymbolsElementResult<T extends object, K = string | number> {
    value?: T;
    parentValue?: T;
    keyName?: K;
    /** Index of the parent `keyName` */
    keys?: K[];
}
type SymbolsElementProps<T extends TagType = 'span'> = {
    as?: T;
    render?: (props: SymbolsElement<T>, result: SymbolsElementResult<object>) => React.ReactNode;
    'data-type'?: string;
};
export type SymbolsElement<T extends TagType = 'span'> = SymbolsElementProps<T> & ComponentPropsWithoutRef<T>;
type InitialState<T extends ElementType = 'span'> = {
    Arrow?: SymbolsElement<T>;
    Colon?: SymbolsElement<T>;
    Quote?: SymbolsElement<T>;
    ValueQuote?: SymbolsElement<T>;
    BracketsRight?: SymbolsElement<T>;
    BracketsLeft?: SymbolsElement<T>;
    BraceRight?: SymbolsElement<T>;
    BraceLeft?: SymbolsElement<T>;
};
type Dispatch = React.Dispatch<InitialState<TagType>>;
export declare const useSymbolsStore: () => InitialState<TagType>;
export declare function useSymbols(): [{
    Arrow?: SymbolsElement<TagType> | undefined;
    Colon?: SymbolsElement<TagType> | undefined;
    Quote?: SymbolsElement<TagType> | undefined;
    ValueQuote?: SymbolsElement<TagType> | undefined;
    BracketsRight?: SymbolsElement<TagType> | undefined;
    BracketsLeft?: SymbolsElement<TagType> | undefined;
    BraceRight?: SymbolsElement<TagType> | undefined;
    BraceLeft?: SymbolsElement<TagType> | undefined;
}, import("react").Dispatch<InitialState<TagType>>];
export declare function useSymbolsDispatch(): Dispatch;
interface SymbolsProps {
    initial: InitialState<TagType>;
    dispatch: Dispatch;
}
export declare const Symbols: FC<PropsWithChildren<SymbolsProps>>;
export {};
