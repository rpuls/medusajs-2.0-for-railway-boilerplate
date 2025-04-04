// src/components/common/form/form.tsx
import { InformationCircleSolid } from "@medusajs/icons";
import {
  Hint as HintComponent,
  Label as LabelComponent,
  Text,
  Tooltip,
  clx
} from "@medusajs/ui";
import { Slot } from "radix-ui";
import {
  createContext,
  forwardRef,
  useContext,
  useId
} from "react";
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState
} from "react-hook-form";
import { useTranslation } from "react-i18next";
import { jsx, jsxs } from "react/jsx-runtime";
var Provider = FormProvider;
var FormFieldContext = createContext(
  {}
);
var Field = ({
  ...props
}) => {
  return /* @__PURE__ */ jsx(FormFieldContext.Provider, { value: { name: props.name }, children: /* @__PURE__ */ jsx(Controller, { ...props }) });
};
var FormItemContext = createContext(
  {}
);
var useFormField = () => {
  const fieldContext = useContext(FormFieldContext);
  const itemContext = useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: fieldContext.name });
  const fieldState = getFieldState(fieldContext.name, formState);
  if (!fieldContext) {
    throw new Error("useFormField should be used within a FormField");
  }
  const { id } = itemContext;
  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formLabelId: `${id}-form-item-label`,
    formDescriptionId: `${id}-form-item-description`,
    formErrorMessageId: `${id}-form-item-message`,
    ...fieldState
  };
};
var Item = forwardRef(
  ({ className, ...props }, ref) => {
    const id = useId();
    return /* @__PURE__ */ jsx(FormItemContext.Provider, { value: { id }, children: /* @__PURE__ */ jsx(
      "div",
      {
        ref,
        className: clx("flex flex-col space-y-2", className),
        ...props
      }
    ) });
  }
);
Item.displayName = "Form.Item";
var Label = forwardRef(({ className, optional = false, tooltip, icon, ...props }, ref) => {
  const { formLabelId, formItemId } = useFormField();
  const { t } = useTranslation();
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-x-1", children: [
    /* @__PURE__ */ jsx(
      LabelComponent,
      {
        id: formLabelId,
        ref,
        className: clx(className),
        htmlFor: formItemId,
        size: "small",
        weight: "plus",
        ...props
      }
    ),
    tooltip && /* @__PURE__ */ jsx(Tooltip, { content: tooltip, children: /* @__PURE__ */ jsx(InformationCircleSolid, { className: "text-ui-fg-muted" }) }),
    icon,
    optional && /* @__PURE__ */ jsxs(Text, { size: "small", leading: "compact", className: "text-ui-fg-muted", children: [
      "(",
      t("fields.optional"),
      ")"
    ] })
  ] });
});
Label.displayName = "Form.Label";
var Control = forwardRef(({ ...props }, ref) => {
  const {
    error,
    formItemId,
    formDescriptionId,
    formErrorMessageId,
    formLabelId
  } = useFormField();
  return /* @__PURE__ */ jsx(
    Slot.Root,
    {
      ref,
      id: formItemId,
      "aria-describedby": !error ? `${formDescriptionId}` : `${formDescriptionId} ${formErrorMessageId}`,
      "aria-invalid": !!error,
      "aria-labelledby": formLabelId,
      ...props
    }
  );
});
Control.displayName = "Form.Control";
var Hint = forwardRef(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();
  return /* @__PURE__ */ jsx(
    HintComponent,
    {
      ref,
      id: formDescriptionId,
      className,
      ...props
    }
  );
});
Hint.displayName = "Form.Hint";
var ErrorMessage = forwardRef(({ className, children, ...props }, ref) => {
  const { error, formErrorMessageId } = useFormField();
  const msg = error ? String(error?.message) : children;
  if (!msg || msg === "undefined") {
    return null;
  }
  return /* @__PURE__ */ jsx(
    HintComponent,
    {
      ref,
      id: formErrorMessageId,
      className,
      variant: error ? "error" : "info",
      ...props,
      children: msg
    }
  );
});
ErrorMessage.displayName = "Form.ErrorMessage";
var Form = Object.assign(Provider, {
  Item,
  Label,
  Control,
  Hint,
  ErrorMessage,
  Field
});

// src/lib/client/client.ts
import Medusa from "@medusajs/js-sdk";
var backendUrl = __BACKEND_URL__ ?? "/";
var sdk = new Medusa({
  baseUrl: backendUrl,
  auth: {
    type: "session"
  }
});
if (typeof window !== "undefined") {
  ;
  window.__sdk = sdk;
}

export {
  Form,
  sdk
};
