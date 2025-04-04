import { type TagType } from '../store/Types';
import { type SectionElement } from '../store/Section';
import { type SectionElementResult } from '../store/Section';
export declare const Row: {
    <K extends TagType>(props: SectionElement<K>): null;
    displayName: string;
};
export interface RowCompProps<T extends object> extends React.HTMLAttributes<HTMLDivElement>, SectionElementResult<T> {
}
export declare const RowComp: {
    <T extends object>(props: React.PropsWithChildren<RowCompProps<T>>): string | number | true | Iterable<import("react").ReactNode> | import("react/jsx-runtime").JSX.Element;
    displayName: string;
};
