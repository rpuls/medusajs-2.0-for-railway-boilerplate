type Elements = Array<Element | null>;
export declare function hideElementFromAccessibilityTree(element: Element): () => void;
export declare function disableAccessibilityTreeOutside(id: string, elements: Elements): () => void;
export {};
