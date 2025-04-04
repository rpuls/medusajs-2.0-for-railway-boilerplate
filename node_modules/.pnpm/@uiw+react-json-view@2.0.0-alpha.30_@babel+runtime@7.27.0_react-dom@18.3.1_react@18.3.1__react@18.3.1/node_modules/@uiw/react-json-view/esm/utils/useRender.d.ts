import { type SymbolsElement } from '../store/Symbols';
import { type TagType, type TypesElement } from '../store/Types';
import { type SectionElement } from '../store/Section';
export declare function useSymbolsRender<K extends TagType>(currentProps: SymbolsElement<TagType>, props: SymbolsElement<K>, key: string): void;
export declare function useTypesRender<K extends TagType>(currentProps: TypesElement<TagType>, props: TypesElement<K>, key: string): void;
export declare function useSectionRender<K extends TagType>(currentProps: SectionElement<TagType>, props: SectionElement<K>, key: string): void;
