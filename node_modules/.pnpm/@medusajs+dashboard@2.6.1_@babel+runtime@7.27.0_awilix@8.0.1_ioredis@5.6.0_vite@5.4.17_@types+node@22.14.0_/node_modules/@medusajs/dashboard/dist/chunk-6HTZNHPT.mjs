// src/components/utilities/keybound-form/keybound-form.tsx
import React from "react";
import { jsx } from "react/jsx-runtime";
var KeyboundForm = React.forwardRef(({ onSubmit, onKeyDown, ...rest }, ref) => {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit?.(event);
  };
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      if (event.target instanceof HTMLTextAreaElement && !(event.metaKey || event.ctrlKey)) {
        return;
      }
      event.preventDefault();
      if (event.metaKey || event.ctrlKey) {
        handleSubmit(event);
      }
    }
  };
  return /* @__PURE__ */ jsx(
    "form",
    {
      ...rest,
      onSubmit: handleSubmit,
      onKeyDown: onKeyDown ?? handleKeyDown,
      ref
    }
  );
});
KeyboundForm.displayName = "KeyboundForm";

export {
  KeyboundForm
};
