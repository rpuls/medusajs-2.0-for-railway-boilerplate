"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataTableTable = void 0;
const tslib_1 = require("tslib");
const React = tslib_1.__importStar(require("react"));
const table_1 = require("../../../components/table");
const react_table_1 = require("@tanstack/react-table");
const use_data_table_context_1 = require("../../data-table/context/use-data-table-context");
const skeleton_1 = require("../../../components/skeleton");
const text_1 = require("../../../components/text");
const clx_1 = require("../../../utils/clx");
const types_1 = require("../types");
const data_table_sorting_icon_1 = require("./data-table-sorting-icon");
/**
 * This component renders the table in a data table, supporting advanced features.
 */
const DataTableTable = (props) => {
    const hoveredRowId = React.useRef(null);
    const isKeyDown = React.useRef(false);
    const [showStickyBorder, setShowStickyBorder] = React.useState(false);
    const scrollableRef = React.useRef(null);
    const { instance } = (0, use_data_table_context_1.useDataTableContext)();
    const pageIndex = instance.pageIndex;
    const columns = instance.getAllColumns();
    const hasSelect = columns.find((c) => c.id === "select");
    const hasActions = columns.find((c) => c.id === "action");
    React.useEffect(() => {
        const onKeyDownHandler = (event) => {
            // If an editable element is focused, we don't want to select a row
            const isEditableElementFocused = getIsEditableElementFocused();
            if (event.key.toLowerCase() === "x" &&
                hoveredRowId &&
                !isKeyDown.current &&
                !isEditableElementFocused) {
                isKeyDown.current = true;
                const row = instance
                    .getRowModel()
                    .rows.find((r) => r.id === hoveredRowId.current);
                if (row && row.getCanSelect()) {
                    row.toggleSelected();
                }
            }
        };
        const onKeyUpHandler = (event) => {
            if (event.key.toLowerCase() === "x") {
                isKeyDown.current = false;
            }
        };
        document.addEventListener("keydown", onKeyDownHandler);
        document.addEventListener("keyup", onKeyUpHandler);
        return () => {
            document.removeEventListener("keydown", onKeyDownHandler);
            document.removeEventListener("keyup", onKeyUpHandler);
        };
    }, [hoveredRowId, instance]);
    const handleHorizontalScroll = (e) => {
        const scrollLeft = e.currentTarget.scrollLeft;
        if (scrollLeft > 0) {
            setShowStickyBorder(true);
        }
        else {
            setShowStickyBorder(false);
        }
    };
    React.useEffect(() => {
        var _a;
        (_a = scrollableRef.current) === null || _a === void 0 ? void 0 : _a.scroll({ top: 0, left: 0 });
    }, [pageIndex]);
    if (instance.showSkeleton) {
        return React.createElement(DataTableTableSkeleton, { pageSize: instance.pageSize });
    }
    return (React.createElement("div", { className: "flex w-full flex-1 flex-col overflow-hidden" },
        instance.emptyState === types_1.DataTableEmptyState.POPULATED && (React.createElement("div", { ref: scrollableRef, onScroll: handleHorizontalScroll, className: "min-h-0 w-full flex-1 overflow-auto overscroll-none border-y" },
            React.createElement(table_1.Table, { className: "relative isolate w-full" },
                React.createElement(table_1.Table.Header, { className: "shadow-ui-border-base sticky inset-x-0 top-0 z-[1] w-full border-b-0 border-t-0 shadow-[0_1px_1px_0]", style: { transform: "translate3d(0,0,0)" } }, instance.getHeaderGroups().map((headerGroup) => (React.createElement(table_1.Table.Row, { key: headerGroup.id, className: (0, clx_1.clx)("border-b-0", {
                        "[&_th:last-of-type]:w-[1%] [&_th:last-of-type]:whitespace-nowrap": hasActions,
                        "[&_th:first-of-type]:w-[1%] [&_th:first-of-type]:whitespace-nowrap": hasSelect,
                    }) }, headerGroup.headers.map((header, idx) => {
                    const canSort = header.column.getCanSort();
                    const sortDirection = header.column.getIsSorted();
                    const sortHandler = header.column.getToggleSortingHandler();
                    const isActionHeader = header.id === "action";
                    const isSelectHeader = header.id === "select";
                    const isSpecialHeader = isActionHeader || isSelectHeader;
                    const Wrapper = canSort ? "button" : "div";
                    const isFirstColumn = hasSelect ? idx === 1 : idx === 0;
                    return (React.createElement(table_1.Table.HeaderCell, { key: header.id, className: (0, clx_1.clx)("whitespace-nowrap", {
                            "w-[calc(20px+24px+24px)] min-w-[calc(20px+24px+24px)] max-w-[calc(20px+24px+24px)]": isSelectHeader,
                            "w-[calc(28px+24px+4px)] min-w-[calc(28px+24px+4px)] max-w-[calc(28px+24px+4px)]": isActionHeader,
                            "after:absolute after:inset-y-0 after:right-0 after:h-full after:w-px after:bg-transparent after:content-['']": isFirstColumn,
                            "after:bg-ui-border-base": showStickyBorder && isFirstColumn,
                            "bg-ui-bg-subtle sticky": isFirstColumn || isSelectHeader,
                            "left-0": isSelectHeader || (isFirstColumn && !hasSelect),
                            "left-[calc(20px+24px+24px)]": isFirstColumn && hasSelect,
                        }), style: !isSpecialHeader
                            ? {
                                width: header.column.columnDef.size,
                                maxWidth: header.column.columnDef.maxSize,
                                minWidth: header.column.columnDef.minSize,
                            }
                            : undefined },
                        React.createElement(Wrapper, { type: canSort ? "button" : undefined, onClick: canSort ? sortHandler : undefined, className: (0, clx_1.clx)("group flex w-fit cursor-default items-center gap-2", {
                                "cursor-pointer": canSort,
                            }) },
                            (0, react_table_1.flexRender)(header.column.columnDef.header, header.getContext()),
                            canSort && (React.createElement(data_table_sorting_icon_1.DataTableSortingIcon, { direction: sortDirection })))));
                }))))),
                React.createElement(table_1.Table.Body, { className: "border-b-0 border-t-0" }, instance.getRowModel().rows.map((row) => {
                    return (React.createElement(table_1.Table.Row, { key: row.id, onMouseEnter: () => (hoveredRowId.current = row.id), onMouseLeave: () => (hoveredRowId.current = null), onClick: (e) => { var _a; return (_a = instance.onRowClick) === null || _a === void 0 ? void 0 : _a.call(instance, e, row); }, className: (0, clx_1.clx)("group/row last-of-type:border-b-0", {
                            "cursor-pointer": !!instance.onRowClick,
                        }) }, row.getVisibleCells().map((cell, idx) => {
                        const isSelectCell = cell.column.id === "select";
                        const isActionCell = cell.column.id === "action";
                        const isSpecialCell = isSelectCell || isActionCell;
                        const isFirstColumn = hasSelect ? idx === 1 : idx === 0;
                        return (React.createElement(table_1.Table.Cell, { key: cell.id, className: (0, clx_1.clx)("items-stretch truncate whitespace-nowrap", {
                                "w-[calc(20px+24px+24px)] min-w-[calc(20px+24px+24px)] max-w-[calc(20px+24px+24px)]": isSelectCell,
                                "w-[calc(28px+24px+4px)] min-w-[calc(28px+24px+4px)] max-w-[calc(28px+24px+4px)]": isActionCell,
                                "bg-ui-bg-base group-hover/row:bg-ui-bg-base-hover transition-fg sticky h-full": isFirstColumn || isSelectCell,
                                "after:absolute after:inset-y-0 after:right-0 after:h-full after:w-px after:bg-transparent after:content-['']": isFirstColumn,
                                "after:bg-ui-border-base": showStickyBorder && isFirstColumn,
                                "left-0": isSelectCell || (isFirstColumn && !hasSelect),
                                "left-[calc(20px+24px+24px)]": isFirstColumn && hasSelect,
                            }), style: !isSpecialCell
                                ? {
                                    width: cell.column.columnDef.size,
                                    maxWidth: cell.column.columnDef.maxSize,
                                    minWidth: cell.column.columnDef.minSize,
                                }
                                : undefined }, (0, react_table_1.flexRender)(cell.column.columnDef.cell, cell.getContext())));
                    })));
                }))))),
        React.createElement(DataTableEmptyStateDisplay, { state: instance.emptyState, props: props.emptyState })));
};
exports.DataTableTable = DataTableTable;
DataTableTable.displayName = "DataTable.Table";
const DefaultEmptyStateContent = ({ heading, description, }) => (React.createElement("div", { className: "flex size-full flex-col items-center justify-center gap-2" },
    React.createElement(text_1.Text, { size: "base", weight: "plus" }, heading),
    React.createElement(text_1.Text, null, description)));
const DataTableEmptyStateDisplay = ({ state, props, }) => {
    var _a;
    if (state === types_1.DataTableEmptyState.POPULATED) {
        return null;
    }
    const content = state === types_1.DataTableEmptyState.EMPTY ? props === null || props === void 0 ? void 0 : props.empty : props === null || props === void 0 ? void 0 : props.filtered;
    return (React.createElement("div", { className: "flex min-h-[250px] w-full flex-1 flex-col items-center justify-center border-y px-6 py-4" }, (_a = content === null || content === void 0 ? void 0 : content.custom) !== null && _a !== void 0 ? _a : (React.createElement(DefaultEmptyStateContent, { heading: content === null || content === void 0 ? void 0 : content.heading, description: content === null || content === void 0 ? void 0 : content.description }))));
};
const DataTableTableSkeleton = ({ pageSize = 10, }) => {
    return (React.createElement("div", { className: "flex w-full flex-1 flex-col overflow-hidden" },
        React.createElement("div", { className: "min-h-0 w-full flex-1 overscroll-none border-y" },
            React.createElement("div", { className: "flex flex-col divide-y" },
                React.createElement(skeleton_1.Skeleton, { className: "h-12 w-full" }),
                Array.from({ length: pageSize }, (_, i) => i).map((row) => (React.createElement(skeleton_1.Skeleton, { key: row, className: "h-12 w-full rounded-none" })))))));
};
function getIsEditableElementFocused() {
    const activeElement = !!document ? document.activeElement : null;
    const isEditableElementFocused = activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        (activeElement === null || activeElement === void 0 ? void 0 : activeElement.getAttribute("contenteditable")) === "true";
    return isEditableElementFocused;
}
//# sourceMappingURL=data-table-table.js.map