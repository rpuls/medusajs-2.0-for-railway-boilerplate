interface Props {
    attribute: string;
    contentId?: string;
    contentElement?: HTMLElement | null;
    enabled?: boolean;
}
export declare function useRootDialog({ attribute, contentId, contentElement, enabled, }: Props): () => boolean;
export {};
