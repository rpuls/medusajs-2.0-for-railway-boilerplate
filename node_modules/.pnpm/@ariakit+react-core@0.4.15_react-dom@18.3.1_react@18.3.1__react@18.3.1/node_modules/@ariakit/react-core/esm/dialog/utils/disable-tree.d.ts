import { noop } from "@ariakit/core/utils/misc";
type Elements = Array<Element | null>;
export declare function disableTree(element: Element | HTMLElement, ignoredElements?: Elements): typeof noop;
export declare function disableTreeOutside(id: string, elements: Elements): () => void;
export {};
