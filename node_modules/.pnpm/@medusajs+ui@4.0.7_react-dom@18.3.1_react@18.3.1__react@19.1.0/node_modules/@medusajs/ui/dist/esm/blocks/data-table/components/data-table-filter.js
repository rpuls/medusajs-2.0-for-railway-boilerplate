"use client";
import { CheckMini, EllipseMiniSolid, XMark } from "@medusajs/icons";
import * as React from "react";
import { useDataTableContext } from "../../data-table/context/use-data-table-context";
import { isDateComparisonOperator } from "../../data-table/utils/is-date-comparison-operator";
import { DatePicker } from "../../../components/date-picker";
import { Label } from "../../../components/label";
import { Popover } from "../../../components/popover";
import { clx } from "../../../utils/clx";
const DEFAULT_FORMAT_DATE_VALUE = (d) => d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
});
const DEFAULT_RANGE_OPTION_LABEL = "Custom";
const DEFAULT_RANGE_OPTION_START_LABEL = "Starting";
const DEFAULT_RANGE_OPTION_END_LABEL = "Ending";
const DataTableFilter = ({ id, filter }) => {
    const { instance } = useDataTableContext();
    const [open, setOpen] = React.useState(filter === undefined);
    const [isCustom, setIsCustom] = React.useState(false);
    const onOpenChange = React.useCallback((open) => {
        if (!open &&
            (!filter || (Array.isArray(filter) && filter.length === 0))) {
            instance.removeFilter(id);
        }
        setOpen(open);
    }, [instance, id, filter]);
    const removeFilter = React.useCallback(() => {
        instance.removeFilter(id);
    }, [instance, id]);
    const meta = instance.getFilterMeta(id);
    const { type, options, label, ...rest } = meta !== null && meta !== void 0 ? meta : {};
    const { displayValue, isCustomRange } = React.useMemo(() => {
        var _a, _b, _c, _d, _e;
        let displayValue = null;
        let isCustomRange = false;
        if (typeof filter === "string") {
            displayValue = (_b = (_a = options === null || options === void 0 ? void 0 : options.find((o) => o.value === filter)) === null || _a === void 0 ? void 0 : _a.label) !== null && _b !== void 0 ? _b : null;
        }
        if (Array.isArray(filter)) {
            displayValue =
                (_c = filter
                    .map((v) => { var _a; return (_a = options === null || options === void 0 ? void 0 : options.find((o) => o.value === v)) === null || _a === void 0 ? void 0 : _a.label; })
                    .join(", ")) !== null && _c !== void 0 ? _c : null;
        }
        if (isDateComparisonOperator(filter)) {
            displayValue =
                (_e = (_d = options === null || options === void 0 ? void 0 : options.find((o) => {
                    if (!isDateComparisonOperator(o.value)) {
                        return false;
                    }
                    return (!isCustom &&
                        (filter.$gte === o.value.$gte || (!filter.$gte && !o.value.$gte)) &&
                        (filter.$lte === o.value.$lte || (!filter.$lte && !o.value.$lte)) &&
                        (filter.$gt === o.value.$gt || (!filter.$gt && !o.value.$gt)) &&
                        (filter.$lt === o.value.$lt || (!filter.$lt && !o.value.$lt)));
                })) === null || _d === void 0 ? void 0 : _d.label) !== null && _e !== void 0 ? _e : null;
            if (!displayValue && isDateFilterProps(meta)) {
                const formatDateValue = meta.formatDateValue
                    ? meta.formatDateValue
                    : DEFAULT_FORMAT_DATE_VALUE;
                if (filter.$gte && !filter.$lte) {
                    isCustomRange = true;
                    displayValue = `${meta.rangeOptionStartLabel || DEFAULT_RANGE_OPTION_START_LABEL} ${formatDateValue(new Date(filter.$gte))}`;
                }
                if (filter.$lte && !filter.$gte) {
                    isCustomRange = true;
                    displayValue = `${meta.rangeOptionEndLabel || DEFAULT_RANGE_OPTION_END_LABEL} ${formatDateValue(new Date(filter.$lte))}`;
                }
                if (filter.$gte && filter.$lte) {
                    isCustomRange = true;
                    displayValue = `${formatDateValue(new Date(filter.$gte))} - ${formatDateValue(new Date(filter.$lte))}`;
                }
            }
        }
        return { displayValue, isCustomRange };
    }, [filter, options]);
    React.useEffect(() => {
        if (isCustomRange && !isCustom) {
            setIsCustom(true);
        }
    }, [isCustomRange, isCustom]);
    if (!meta) {
        return null;
    }
    return (React.createElement(Popover, { open: open, onOpenChange: onOpenChange, modal: true },
        React.createElement(Popover.Anchor, { asChild: true },
            React.createElement("div", { className: clx("bg-ui-bg-component flex flex-shrink-0 items-center overflow-hidden rounded-md", "[&>*]:txt-compact-small-plus [&>*]:flex [&>*]:items-center [&>*]:justify-center", {
                    "shadow-borders-base divide-x": displayValue,
                    "border border-dashed": !displayValue,
                }) },
                displayValue && (React.createElement("div", { className: "text-ui-fg-muted whitespace-nowrap px-2 py-1" }, label || id)),
                React.createElement(Popover.Trigger, { className: clx("text-ui-fg-subtle hover:bg-ui-bg-base-hover active:bg-ui-bg-base-pressed transition-fg whitespace-nowrap px-2 py-1 outline-none", {
                        "text-ui-fg-muted": !displayValue,
                    }) }, displayValue || label || id),
                displayValue && (React.createElement("button", { type: "button", className: "text-ui-fg-muted hover:bg-ui-bg-base-hover active:bg-ui-bg-base-pressed transition-fg size-7 outline-none", onClick: removeFilter },
                    React.createElement(XMark, null))))),
        React.createElement(Popover.Content, { align: "start", className: "bg-ui-bg-component p-0 outline-none" }, (() => {
            switch (type) {
                case "select":
                    return (React.createElement(DataTableFilterSelectContent, { id: id, filter: filter, options: options }));
                case "radio":
                    return (React.createElement(DataTableFilterRadioContent, { id: id, filter: filter, options: options }));
                case "date":
                    return (React.createElement(DataTableFilterDateContent, { id: id, filter: filter, options: options, isCustom: isCustom, setIsCustom: setIsCustom, ...rest }));
                default:
                    return null;
            }
        })())));
};
DataTableFilter.displayName = "DataTable.Filter";
const DataTableFilterDateContent = ({ id, filter, options, format = "date", rangeOptionLabel = DEFAULT_RANGE_OPTION_LABEL, rangeOptionStartLabel = DEFAULT_RANGE_OPTION_START_LABEL, rangeOptionEndLabel = DEFAULT_RANGE_OPTION_END_LABEL, disableRangeOption = false, isCustom, setIsCustom, }) => {
    const currentValue = filter;
    const { instance } = useDataTableContext();
    const selectedValue = React.useMemo(() => {
        if (!currentValue || isCustom) {
            return undefined;
        }
        return JSON.stringify(currentValue);
    }, [currentValue, isCustom]);
    const onValueChange = React.useCallback((valueStr) => {
        setIsCustom(false);
        const value = JSON.parse(valueStr);
        instance.updateFilter({ id, value });
    }, [instance, id]);
    const onSelectCustom = React.useCallback(() => {
        setIsCustom(true);
        instance.updateFilter({ id, value: undefined });
    }, [instance, id]);
    const onCustomValueChange = React.useCallback((input, value) => {
        const newCurrentValue = { ...currentValue };
        newCurrentValue[input] = value ? value.toISOString() : undefined;
        instance.updateFilter({ id, value: newCurrentValue });
    }, [instance, id]);
    const { focusedIndex, setFocusedIndex } = useKeyboardNavigation(options, (index) => {
        if (index === options.length && !disableRangeOption) {
            onSelectCustom();
        }
        else {
            onValueChange(JSON.stringify(options[index].value));
        }
    }, disableRangeOption ? 0 : 1);
    const granularity = format === "date-time" ? "minute" : "day";
    const maxDate = (currentValue === null || currentValue === void 0 ? void 0 : currentValue.$lte)
        ? granularity === "minute"
            ? new Date(currentValue.$lte)
            : new Date(new Date(currentValue.$lte).setHours(23, 59, 59, 999))
        : undefined;
    const minDate = (currentValue === null || currentValue === void 0 ? void 0 : currentValue.$gte)
        ? granularity === "minute"
            ? new Date(currentValue.$gte)
            : new Date(new Date(currentValue.$gte).setHours(0, 0, 0, 0))
        : undefined;
    const initialFocusedIndex = isCustom ? options.length : 0;
    const onListFocus = React.useCallback(() => {
        if (focusedIndex === -1) {
            setFocusedIndex(initialFocusedIndex);
        }
    }, [focusedIndex, initialFocusedIndex]);
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "flex flex-col p-1 outline-none", tabIndex: 0, role: "list", onFocus: onListFocus, autoFocus: true },
            options.map((option, idx) => {
                const value = JSON.stringify(option.value);
                const isSelected = selectedValue === value;
                return (React.createElement(OptionButton, { key: idx, index: idx, option: option, isSelected: isSelected, isFocused: focusedIndex === idx, onClick: () => onValueChange(value), onMouseEvent: setFocusedIndex, icon: EllipseMiniSolid }));
            }),
            !disableRangeOption && (React.createElement(OptionButton, { index: options.length, option: {
                    label: rangeOptionLabel,
                    value: "__custom",
                }, icon: EllipseMiniSolid, isSelected: isCustom, isFocused: focusedIndex === options.length, onClick: onSelectCustom, onMouseEvent: setFocusedIndex }))),
        !disableRangeOption && isCustom && (React.createElement(React.Fragment, null,
            React.createElement("div", { className: "flex flex-col py-[3px]" },
                React.createElement("div", { className: "bg-ui-border-menu-top h-px w-full" }),
                React.createElement("div", { className: "bg-ui-border-menu-bot h-px w-full" })),
            React.createElement("div", { className: "flex flex-col gap-2 px-2 pb-3 pt-1" },
                React.createElement("div", { className: "flex flex-col gap-1" },
                    React.createElement(Label, { id: "custom-start-date-label", size: "xsmall", weight: "plus" }, rangeOptionStartLabel),
                    React.createElement(DatePicker, { "aria-labelledby": "custom-start-date-label", granularity: granularity, maxValue: maxDate, value: (currentValue === null || currentValue === void 0 ? void 0 : currentValue.$gte) ? new Date(currentValue.$gte) : null, onChange: (value) => onCustomValueChange("$gte", value) })),
                React.createElement("div", { className: "flex flex-col gap-1" },
                    React.createElement(Label, { id: "custom-end-date-label", size: "xsmall", weight: "plus" }, rangeOptionEndLabel),
                    React.createElement(DatePicker, { "aria-labelledby": "custom-end-date-label", granularity: granularity, minValue: minDate, value: (currentValue === null || currentValue === void 0 ? void 0 : currentValue.$lte) ? new Date(currentValue.$lte) : null, onChange: (value) => onCustomValueChange("$lte", value) })))))));
};
const DataTableFilterSelectContent = ({ id, filter = [], options, }) => {
    const { instance } = useDataTableContext();
    const onValueChange = React.useCallback((value) => {
        if (filter === null || filter === void 0 ? void 0 : filter.includes(value)) {
            const newValues = filter === null || filter === void 0 ? void 0 : filter.filter((v) => v !== value);
            instance.updateFilter({
                id,
                value: newValues,
            });
        }
        else {
            instance.updateFilter({
                id,
                value: [...(filter !== null && filter !== void 0 ? filter : []), value],
            });
        }
    }, [instance, id, filter]);
    const { focusedIndex, setFocusedIndex } = useKeyboardNavigation(options, (index) => onValueChange(options[index].value));
    const onListFocus = React.useCallback(() => {
        if (focusedIndex === -1) {
            setFocusedIndex(0);
        }
    }, [focusedIndex]);
    return (React.createElement("div", { className: "flex flex-col p-1 outline-none", role: "list", tabIndex: 0, onFocus: onListFocus, autoFocus: true }, options.map((option, idx) => {
        const isSelected = !!(filter === null || filter === void 0 ? void 0 : filter.includes(option.value));
        return (React.createElement(OptionButton, { key: idx, index: idx, option: option, isSelected: isSelected, isFocused: focusedIndex === idx, onClick: () => onValueChange(option.value), onMouseEvent: setFocusedIndex, icon: CheckMini }));
    })));
};
const DataTableFilterRadioContent = ({ id, filter, options, }) => {
    const { instance } = useDataTableContext();
    const onValueChange = React.useCallback((value) => {
        instance.updateFilter({ id, value });
    }, [instance, id]);
    const { focusedIndex, setFocusedIndex } = useKeyboardNavigation(options, (index) => onValueChange(options[index].value));
    const onListFocus = React.useCallback(() => {
        if (focusedIndex === -1) {
            setFocusedIndex(0);
        }
    }, [focusedIndex]);
    return (React.createElement("div", { className: "flex flex-col p-1 outline-none", role: "list", tabIndex: 0, onFocus: onListFocus, autoFocus: true }, options.map((option, idx) => {
        const isSelected = filter === option.value;
        return (React.createElement(OptionButton, { key: idx, index: idx, option: option, isSelected: isSelected, isFocused: focusedIndex === idx, onClick: () => onValueChange(option.value), onMouseEvent: setFocusedIndex, icon: EllipseMiniSolid }));
    })));
};
function isDateFilterProps(props) {
    if (!props) {
        return false;
    }
    return props.type === "date";
}
const OptionButton = React.memo(({ index, option, isSelected, isFocused, onClick, onMouseEvent, icon: Icon, }) => (React.createElement("button", { type: "button", role: "listitem", className: clx("bg-ui-bg-component txt-compact-small transition-fg flex items-center gap-2 rounded px-2 py-1 outline-none", { "bg-ui-bg-component-hover": isFocused }), onClick: onClick, onMouseEnter: () => onMouseEvent(index), onMouseLeave: () => onMouseEvent(-1), tabIndex: -1 },
    React.createElement("div", { className: "flex size-[15px] items-center justify-center" }, isSelected && React.createElement(Icon, null)),
    React.createElement("span", null, option.label))));
function useKeyboardNavigation(options, onSelect, extraItems = 0) {
    const [focusedIndex, setFocusedIndex] = React.useState(-1);
    const onKeyDown = React.useCallback((e) => {
        const totalLength = options.length + extraItems;
        if (document.activeElement.contentEditable === "true") {
            return;
        }
        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setFocusedIndex((prev) => (prev < totalLength - 1 ? prev + 1 : prev));
                break;
            case "ArrowUp":
                e.preventDefault();
                setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev));
                break;
            case " ":
            case "Enter":
                e.preventDefault();
                if (focusedIndex >= 0) {
                    onSelect(focusedIndex);
                }
                break;
        }
    }, [options.length, extraItems, focusedIndex, onSelect]);
    React.useEffect(() => {
        window.addEventListener("keydown", onKeyDown);
        return () => {
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [onKeyDown]);
    return { focusedIndex, setFocusedIndex };
}
export { DataTableFilter };
//# sourceMappingURL=data-table-filter.js.map