export declare function usePrevious<T>(value: T): T | undefined;
interface UseHighlight {
    value: any;
    highlightUpdates?: boolean;
    highlightContainer: React.MutableRefObject<HTMLSpanElement | null>;
}
export declare function useHighlight({ value, highlightUpdates, highlightContainer }: UseHighlight): void;
export {};
