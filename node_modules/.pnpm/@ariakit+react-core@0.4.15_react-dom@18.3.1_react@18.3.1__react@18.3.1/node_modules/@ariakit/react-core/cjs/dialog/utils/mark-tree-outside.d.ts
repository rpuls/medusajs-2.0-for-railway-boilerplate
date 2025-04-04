type Elements = Array<Element | null>;
export declare function markElement(element: Element, id?: string): () => void;
export declare function markAncestor(element: Element, id?: string): () => void;
export declare function isElementMarked(element: Element, id?: string): boolean;
export declare function markTreeOutside(id: string, elements: Elements): () => void;
export {};
