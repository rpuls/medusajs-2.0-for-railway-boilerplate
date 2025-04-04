// src/components/inputs/chip-input/chip-input.tsx
import { XMarkMini } from "@medusajs/icons";
import { Badge, clx } from "@medusajs/ui";
import { AnimatePresence, motion } from "motion/react";
import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState
} from "react";
import { jsx, jsxs } from "react/jsx-runtime";
var ChipInput = forwardRef(
  ({
    value,
    onChange,
    onBlur,
    disabled,
    name,
    showRemove = true,
    variant = "base",
    allowDuplicates = false,
    placeholder,
    className
  }, ref) => {
    const innerRef = useRef(null);
    const isControlledRef = useRef(typeof value !== "undefined");
    const isControlled = isControlledRef.current;
    const [uncontrolledValue, setUncontrolledValue] = useState([]);
    useImperativeHandle(
      ref,
      () => innerRef.current
    );
    const [duplicateIndex, setDuplicateIndex] = useState(null);
    const chips = isControlled ? value : uncontrolledValue;
    const handleAddChip = (chip) => {
      const cleanValue = chip.trim();
      if (!cleanValue) {
        return;
      }
      if (!allowDuplicates && chips.includes(cleanValue)) {
        setDuplicateIndex(chips.indexOf(cleanValue));
        setTimeout(() => {
          setDuplicateIndex(null);
        }, 300);
        return;
      }
      onChange?.([...chips, cleanValue]);
      if (!isControlled) {
        setUncontrolledValue([...chips, cleanValue]);
      }
    };
    const handleRemoveChip = (chip) => {
      onChange?.(chips.filter((v) => v !== chip));
      if (!isControlled) {
        setUncontrolledValue(chips.filter((v) => v !== chip));
      }
    };
    const handleBlur = (e) => {
      onBlur?.();
      if (e.target.value) {
        handleAddChip(e.target.value);
        e.target.value = "";
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        if (!innerRef.current?.value) {
          return;
        }
        handleAddChip(innerRef.current?.value ?? "");
        innerRef.current.value = "";
        innerRef.current?.focus();
      }
      if (e.key === "Backspace" && innerRef.current?.value === "") {
        handleRemoveChip(chips[chips.length - 1]);
      }
    };
    const shake = {
      x: [0, -2, 2, -2, 2, 0],
      transition: { duration: 0.3 }
    };
    return /* @__PURE__ */ jsxs(
      "div",
      {
        className: clx(
          "shadow-borders-base flex min-h-8 flex-wrap items-center gap-1 rounded-md px-2 py-1.5",
          "transition-fg focus-within:shadow-borders-interactive-with-active",
          "has-[input:disabled]:bg-ui-bg-disabled has-[input:disabled]:text-ui-fg-disabled has-[input:disabled]:cursor-not-allowed",
          {
            "bg-ui-bg-field-component hover:bg-ui-bg-field-component-hover": variant === "contrast",
            "bg-ui-bg-field hover:bg-ui-bg-field-hover": variant === "base"
          },
          className
        ),
        tabIndex: -1,
        onClick: () => innerRef.current?.focus(),
        children: [
          chips.map((v, index) => {
            return /* @__PURE__ */ jsx(AnimatePresence, { children: /* @__PURE__ */ jsx(
              Badge,
              {
                size: "2xsmall",
                className: clx("gap-x-0.5 pl-1.5 pr-1.5", {
                  "transition-fg pr-1": showRemove,
                  "shadow-borders-focus": index === duplicateIndex
                }),
                asChild: true,
                children: /* @__PURE__ */ jsxs(
                  motion.div,
                  {
                    animate: index === duplicateIndex ? shake : void 0,
                    children: [
                      v,
                      showRemove && /* @__PURE__ */ jsx(
                        "button",
                        {
                          tabIndex: -1,
                          type: "button",
                          onClick: () => handleRemoveChip(v),
                          className: clx(
                            "text-ui-fg-subtle transition-fg outline-none"
                          ),
                          children: /* @__PURE__ */ jsx(XMarkMini, {})
                        }
                      )
                    ]
                  }
                )
              }
            ) }, `${v}-${index}`);
          }),
          /* @__PURE__ */ jsx(
            "input",
            {
              className: clx(
                "caret-ui-fg-base text-ui-fg-base txt-compact-small flex-1 appearance-none bg-transparent",
                "disabled:text-ui-fg-disabled disabled:cursor-not-allowed",
                "focus:outline-none",
                "placeholder:text-ui-fg-muted"
              ),
              onKeyDown: handleKeyDown,
              onBlur: handleBlur,
              disabled,
              name,
              ref: innerRef,
              placeholder: chips.length === 0 ? placeholder : void 0,
              autoComplete: "off"
            }
          )
        ]
      }
    );
  }
);
ChipInput.displayName = "ChipInput";

export {
  ChipInput
};
