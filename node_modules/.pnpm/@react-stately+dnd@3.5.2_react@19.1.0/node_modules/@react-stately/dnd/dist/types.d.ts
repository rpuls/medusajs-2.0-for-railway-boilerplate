import { Collection, DraggableCollectionEndEvent, DraggableCollectionProps, DragItem, DragMoveEvent, DragPreviewRenderer, DragStartEvent, DropOperation, Key, Node, RefObject, DragTypes, DroppableCollectionProps, DropTarget } from "@react-types/shared";
import { MultipleSelectionManager } from "@react-stately/selection";
export interface DraggableCollectionStateOptions extends DraggableCollectionProps {
    /** A collection of items. */
    collection: Collection<Node<unknown>>;
    /** An interface for reading and updating multiple selection state. */
    selectionManager: MultipleSelectionManager;
    /** Whether the drag events should be disabled. */
    isDisabled?: boolean;
}
export interface DraggableCollectionState {
    /** A collection of items. */
    collection: Collection<Node<unknown>>;
    /** An interface for reading and updating multiple selection state. */
    selectionManager: MultipleSelectionManager;
    /** The key of the item that initiated a drag. */
    draggedKey: Key | null;
    /** The keys of the items that are currently being dragged. */
    draggingKeys: Set<Key>;
    /** Whether drag events are disabled. */
    isDisabled?: boolean;
    /** Returns whether the given key is currently being dragged. */
    isDragging(key: Key): boolean;
    /** Returns the keys of the items that will be dragged with the given key (e.g. selected items). */
    getKeysForDrag(key: Key): Set<Key>;
    /** Returns the items to drag for the given key. */
    getItems(key: Key): DragItem[];
    /** The ref of the element that will be rendered as the drag preview while dragging. */
    preview?: RefObject<DragPreviewRenderer | null>;
    /** Function that returns the drop operations that are allowed for the dragged items. If not provided, all drop operations are allowed. */
    getAllowedDropOperations?: () => DropOperation[];
    /** Begins a drag for the given key. This triggers the onDragStart event. */
    startDrag(key: Key, event: DragStartEvent): void;
    /** Triggers an onDragMove event. */
    moveDrag(event: DragMoveEvent): void;
    /** Ends the current drag, and emits an onDragEnd event. */
    endDrag(event: DraggableCollectionEndEvent): void;
}
/**
 * Manages state for a draggable collection.
 */
export function useDraggableCollectionState(props: DraggableCollectionStateOptions): DraggableCollectionState;
interface DropOperationEvent {
    target: DropTarget;
    types: DragTypes;
    allowedOperations: DropOperation[];
    isInternal: boolean;
    draggingKeys: Set<Key>;
}
export interface DroppableCollectionStateOptions extends Omit<DroppableCollectionProps, 'onDropMove' | 'onDropActivate'> {
    /** A collection of items. */
    collection: Collection<Node<unknown>>;
    /** An interface for reading and updating multiple selection state. */
    selectionManager: MultipleSelectionManager;
    /** Whether the drop events should be disabled. */
    isDisabled?: boolean;
}
export interface DroppableCollectionState {
    /** A collection of items. */
    collection: Collection<Node<unknown>>;
    /** An interface for reading and updating multiple selection state. */
    selectionManager: MultipleSelectionManager;
    /** The current drop target. */
    target: DropTarget | null;
    /** Whether drop events are disabled. */
    isDisabled?: boolean;
    /** Sets the current drop target. */
    setTarget(target: DropTarget | null): void;
    /** Returns whether the given target is equivalent to the current drop target. */
    isDropTarget(target: DropTarget | null): boolean;
    /** Returns the drop operation for the given parameters. */
    getDropOperation(e: DropOperationEvent): DropOperation;
}
/**
 * Manages state for a droppable collection.
 */
export function useDroppableCollectionState(props: DroppableCollectionStateOptions): DroppableCollectionState;

//# sourceMappingURL=types.d.ts.map
