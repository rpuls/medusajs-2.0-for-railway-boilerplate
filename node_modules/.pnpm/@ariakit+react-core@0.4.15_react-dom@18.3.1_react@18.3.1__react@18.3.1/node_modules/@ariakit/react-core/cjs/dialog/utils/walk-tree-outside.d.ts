type Elements = Array<Element | null>;
export declare function isValidElement(id: string, element: Element, ignoredElements: Elements): boolean;
export declare function walkTreeOutside(id: string, elements: Elements, callback: (element: Element, originalElement: Element) => void, ancestorCallback?: (element: Element, originalElement: Element) => void): void;
export declare function createWalkTreeSnapshot(id: string, elements: Elements): () => void;
export {};
