"use strict";
"use client";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// packages/react/form/src/index.ts
var src_exports = {};
__export(src_exports, {
  Control: () => Control,
  Field: () => Field,
  Form: () => Form,
  FormControl: () => FormControl,
  FormField: () => FormField,
  FormLabel: () => FormLabel,
  FormMessage: () => FormMessage,
  FormSubmit: () => FormSubmit,
  FormValidityState: () => FormValidityState,
  Label: () => Label,
  Message: () => Message,
  Root: () => Root,
  Submit: () => Submit,
  ValidityState: () => ValidityState,
  createFormScope: () => createFormScope
});
module.exports = __toCommonJS(src_exports);

// packages/react/form/src/Form.tsx
var React = __toESM(require("react"));
var import_primitive = require("@radix-ui/primitive");
var import_react_compose_refs = require("@radix-ui/react-compose-refs");
var import_react_context = require("@radix-ui/react-context");
var import_react_id = require("@radix-ui/react-id");
var import_react_label = require("@radix-ui/react-label");
var import_react_primitive = require("@radix-ui/react-primitive");
var import_jsx_runtime = require("react/jsx-runtime");
var [createFormContext, createFormScope] = (0, import_react_context.createContextScope)("Form");
var FORM_NAME = "Form";
var [ValidationProvider, useValidationContext] = createFormContext(FORM_NAME);
var [AriaDescriptionProvider, useAriaDescriptionContext] = createFormContext(FORM_NAME);
var Form = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeForm, onClearServerErrors = () => {
    }, ...rootProps } = props;
    const formRef = React.useRef(null);
    const composedFormRef = (0, import_react_compose_refs.useComposedRefs)(forwardedRef, formRef);
    const [validityMap, setValidityMap] = React.useState({});
    const getFieldValidity = React.useCallback(
      (fieldName) => validityMap[fieldName],
      [validityMap]
    );
    const handleFieldValidityChange = React.useCallback(
      (fieldName, validity) => setValidityMap((prevValidityMap) => ({
        ...prevValidityMap,
        [fieldName]: { ...prevValidityMap[fieldName] ?? {}, ...validity }
      })),
      []
    );
    const handleFieldValiditionClear = React.useCallback((fieldName) => {
      setValidityMap((prevValidityMap) => ({ ...prevValidityMap, [fieldName]: void 0 }));
      setCustomErrorsMap((prevCustomErrorsMap) => ({ ...prevCustomErrorsMap, [fieldName]: {} }));
    }, []);
    const [customMatcherEntriesMap, setCustomMatcherEntriesMap] = React.useState({});
    const getFieldCustomMatcherEntries = React.useCallback(
      (fieldName) => customMatcherEntriesMap[fieldName] ?? [],
      [customMatcherEntriesMap]
    );
    const handleFieldCustomMatcherAdd = React.useCallback((fieldName, matcherEntry) => {
      setCustomMatcherEntriesMap((prevCustomMatcherEntriesMap) => ({
        ...prevCustomMatcherEntriesMap,
        [fieldName]: [...prevCustomMatcherEntriesMap[fieldName] ?? [], matcherEntry]
      }));
    }, []);
    const handleFieldCustomMatcherRemove = React.useCallback((fieldName, matcherEntryId) => {
      setCustomMatcherEntriesMap((prevCustomMatcherEntriesMap) => ({
        ...prevCustomMatcherEntriesMap,
        [fieldName]: (prevCustomMatcherEntriesMap[fieldName] ?? []).filter(
          (matcherEntry) => matcherEntry.id !== matcherEntryId
        )
      }));
    }, []);
    const [customErrorsMap, setCustomErrorsMap] = React.useState({});
    const getFieldCustomErrors = React.useCallback(
      (fieldName) => customErrorsMap[fieldName] ?? {},
      [customErrorsMap]
    );
    const handleFieldCustomErrorsChange = React.useCallback((fieldName, customErrors) => {
      setCustomErrorsMap((prevCustomErrorsMap) => ({
        ...prevCustomErrorsMap,
        [fieldName]: { ...prevCustomErrorsMap[fieldName] ?? {}, ...customErrors }
      }));
    }, []);
    const [messageIdsMap, setMessageIdsMap] = React.useState({});
    const handleFieldMessageIdAdd = React.useCallback((fieldName, id) => {
      setMessageIdsMap((prevMessageIdsMap) => {
        const fieldDescriptionIds = new Set(prevMessageIdsMap[fieldName]).add(id);
        return { ...prevMessageIdsMap, [fieldName]: fieldDescriptionIds };
      });
    }, []);
    const handleFieldMessageIdRemove = React.useCallback((fieldName, id) => {
      setMessageIdsMap((prevMessageIdsMap) => {
        const fieldDescriptionIds = new Set(prevMessageIdsMap[fieldName]);
        fieldDescriptionIds.delete(id);
        return { ...prevMessageIdsMap, [fieldName]: fieldDescriptionIds };
      });
    }, []);
    const getFieldDescription = React.useCallback(
      (fieldName) => Array.from(messageIdsMap[fieldName] ?? []).join(" ") || void 0,
      [messageIdsMap]
    );
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      ValidationProvider,
      {
        scope: __scopeForm,
        getFieldValidity,
        onFieldValidityChange: handleFieldValidityChange,
        getFieldCustomMatcherEntries,
        onFieldCustomMatcherEntryAdd: handleFieldCustomMatcherAdd,
        onFieldCustomMatcherEntryRemove: handleFieldCustomMatcherRemove,
        getFieldCustomErrors,
        onFieldCustomErrorsChange: handleFieldCustomErrorsChange,
        onFieldValiditionClear: handleFieldValiditionClear,
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          AriaDescriptionProvider,
          {
            scope: __scopeForm,
            onFieldMessageIdAdd: handleFieldMessageIdAdd,
            onFieldMessageIdRemove: handleFieldMessageIdRemove,
            getFieldDescription,
            children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              import_react_primitive.Primitive.form,
              {
                ...rootProps,
                ref: composedFormRef,
                onInvalid: (0, import_primitive.composeEventHandlers)(props.onInvalid, (event) => {
                  const firstInvalidControl = getFirstInvalidControl(event.currentTarget);
                  if (firstInvalidControl === event.target) firstInvalidControl.focus();
                  event.preventDefault();
                }),
                onSubmit: (0, import_primitive.composeEventHandlers)(props.onSubmit, onClearServerErrors, {
                  checkForDefaultPrevented: false
                }),
                onReset: (0, import_primitive.composeEventHandlers)(props.onReset, onClearServerErrors)
              }
            )
          }
        )
      }
    );
  }
);
Form.displayName = FORM_NAME;
var FIELD_NAME = "FormField";
var [FormFieldProvider, useFormFieldContext] = createFormContext(FIELD_NAME);
var FormField = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeForm, name, serverInvalid = false, ...fieldProps } = props;
    const validationContext = useValidationContext(FIELD_NAME, __scopeForm);
    const validity = validationContext.getFieldValidity(name);
    const id = (0, import_react_id.useId)();
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormFieldProvider, { scope: __scopeForm, id, name, serverInvalid, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_react_primitive.Primitive.div,
      {
        "data-valid": getValidAttribute(validity, serverInvalid),
        "data-invalid": getInvalidAttribute(validity, serverInvalid),
        ...fieldProps,
        ref: forwardedRef
      }
    ) });
  }
);
FormField.displayName = FIELD_NAME;
var LABEL_NAME = "FormLabel";
var FormLabel = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeForm, ...labelProps } = props;
    const validationContext = useValidationContext(LABEL_NAME, __scopeForm);
    const fieldContext = useFormFieldContext(LABEL_NAME, __scopeForm);
    const htmlFor = labelProps.htmlFor || fieldContext.id;
    const validity = validationContext.getFieldValidity(fieldContext.name);
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_react_label.Label,
      {
        "data-valid": getValidAttribute(validity, fieldContext.serverInvalid),
        "data-invalid": getInvalidAttribute(validity, fieldContext.serverInvalid),
        ...labelProps,
        ref: forwardedRef,
        htmlFor
      }
    );
  }
);
FormLabel.displayName = LABEL_NAME;
var CONTROL_NAME = "FormControl";
var FormControl = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeForm, ...controlProps } = props;
    const validationContext = useValidationContext(CONTROL_NAME, __scopeForm);
    const fieldContext = useFormFieldContext(CONTROL_NAME, __scopeForm);
    const ariaDescriptionContext = useAriaDescriptionContext(CONTROL_NAME, __scopeForm);
    const ref = React.useRef(null);
    const composedRef = (0, import_react_compose_refs.useComposedRefs)(forwardedRef, ref);
    const name = controlProps.name || fieldContext.name;
    const id = controlProps.id || fieldContext.id;
    const customMatcherEntries = validationContext.getFieldCustomMatcherEntries(name);
    const { onFieldValidityChange, onFieldCustomErrorsChange, onFieldValiditionClear } = validationContext;
    const updateControlValidity = React.useCallback(
      async (control) => {
        if (hasBuiltInError(control.validity)) {
          const controlValidity2 = validityStateToObject(control.validity);
          onFieldValidityChange(name, controlValidity2);
          return;
        }
        const formData = control.form ? new FormData(control.form) : new FormData();
        const matcherArgs = [control.value, formData];
        const syncCustomMatcherEntries = [];
        const ayncCustomMatcherEntries = [];
        customMatcherEntries.forEach((customMatcherEntry) => {
          if (isAsyncCustomMatcherEntry(customMatcherEntry, matcherArgs)) {
            ayncCustomMatcherEntries.push(customMatcherEntry);
          } else if (isSyncCustomMatcherEntry(customMatcherEntry)) {
            syncCustomMatcherEntries.push(customMatcherEntry);
          }
        });
        const syncCustomErrors = syncCustomMatcherEntries.map(({ id: id2, match }) => {
          return [id2, match(...matcherArgs)];
        });
        const syncCustomErrorsById = Object.fromEntries(syncCustomErrors);
        const hasSyncCustomErrors = Object.values(syncCustomErrorsById).some(Boolean);
        const hasCustomError = hasSyncCustomErrors;
        control.setCustomValidity(hasCustomError ? DEFAULT_INVALID_MESSAGE : "");
        const controlValidity = validityStateToObject(control.validity);
        onFieldValidityChange(name, controlValidity);
        onFieldCustomErrorsChange(name, syncCustomErrorsById);
        if (!hasSyncCustomErrors && ayncCustomMatcherEntries.length > 0) {
          const promisedCustomErrors = ayncCustomMatcherEntries.map(
            ({ id: id2, match }) => match(...matcherArgs).then((matches) => [id2, matches])
          );
          const asyncCustomErrors = await Promise.all(promisedCustomErrors);
          const asyncCustomErrorsById = Object.fromEntries(asyncCustomErrors);
          const hasAsyncCustomErrors = Object.values(asyncCustomErrorsById).some(Boolean);
          const hasCustomError2 = hasAsyncCustomErrors;
          control.setCustomValidity(hasCustomError2 ? DEFAULT_INVALID_MESSAGE : "");
          const controlValidity2 = validityStateToObject(control.validity);
          onFieldValidityChange(name, controlValidity2);
          onFieldCustomErrorsChange(name, asyncCustomErrorsById);
        }
      },
      [customMatcherEntries, name, onFieldCustomErrorsChange, onFieldValidityChange]
    );
    React.useEffect(() => {
      const control = ref.current;
      if (control) {
        const handleChange = () => updateControlValidity(control);
        control.addEventListener("change", handleChange);
        return () => control.removeEventListener("change", handleChange);
      }
    }, [updateControlValidity]);
    const resetControlValidity = React.useCallback(() => {
      const control = ref.current;
      if (control) {
        control.setCustomValidity("");
        onFieldValiditionClear(name);
      }
    }, [name, onFieldValiditionClear]);
    React.useEffect(() => {
      const form = ref.current?.form;
      if (form) {
        form.addEventListener("reset", resetControlValidity);
        return () => form.removeEventListener("reset", resetControlValidity);
      }
    }, [resetControlValidity]);
    React.useEffect(() => {
      const control = ref.current;
      const form = control?.closest("form");
      if (form && fieldContext.serverInvalid) {
        const firstInvalidControl = getFirstInvalidControl(form);
        if (firstInvalidControl === control) firstInvalidControl.focus();
      }
    }, [fieldContext.serverInvalid]);
    const validity = validationContext.getFieldValidity(name);
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      import_react_primitive.Primitive.input,
      {
        "data-valid": getValidAttribute(validity, fieldContext.serverInvalid),
        "data-invalid": getInvalidAttribute(validity, fieldContext.serverInvalid),
        "aria-invalid": fieldContext.serverInvalid ? true : void 0,
        "aria-describedby": ariaDescriptionContext.getFieldDescription(name),
        title: "",
        ...controlProps,
        ref: composedRef,
        id,
        name,
        onInvalid: (0, import_primitive.composeEventHandlers)(props.onInvalid, (event) => {
          const control = event.currentTarget;
          updateControlValidity(control);
        }),
        onChange: (0, import_primitive.composeEventHandlers)(props.onChange, (event) => {
          resetControlValidity();
        })
      }
    );
  }
);
FormControl.displayName = CONTROL_NAME;
var DEFAULT_INVALID_MESSAGE = "This value is not valid";
var DEFAULT_BUILT_IN_MESSAGES = {
  badInput: DEFAULT_INVALID_MESSAGE,
  patternMismatch: "This value does not match the required pattern",
  rangeOverflow: "This value is too large",
  rangeUnderflow: "This value is too small",
  stepMismatch: "This value does not match the required step",
  tooLong: "This value is too long",
  tooShort: "This value is too short",
  typeMismatch: "This value does not match the required type",
  valid: void 0,
  valueMissing: "This value is missing"
};
var MESSAGE_NAME = "FormMessage";
var FormMessage = React.forwardRef(
  (props, forwardedRef) => {
    const { match, name: nameProp, ...messageProps } = props;
    const fieldContext = useFormFieldContext(MESSAGE_NAME, props.__scopeForm);
    const name = nameProp ?? fieldContext.name;
    if (match === void 0) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormMessageImpl, { ...messageProps, ref: forwardedRef, name, children: props.children || DEFAULT_INVALID_MESSAGE });
    } else if (typeof match === "function") {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormCustomMessage, { match, ...messageProps, ref: forwardedRef, name });
    } else {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormBuiltInMessage, { match, ...messageProps, ref: forwardedRef, name });
    }
  }
);
FormMessage.displayName = MESSAGE_NAME;
var FormBuiltInMessage = React.forwardRef(
  (props, forwardedRef) => {
    const { match, forceMatch = false, name, children, ...messageProps } = props;
    const validationContext = useValidationContext(MESSAGE_NAME, messageProps.__scopeForm);
    const validity = validationContext.getFieldValidity(name);
    const matches = forceMatch || validity?.[match];
    if (matches) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormMessageImpl, { ref: forwardedRef, ...messageProps, name, children: children ?? DEFAULT_BUILT_IN_MESSAGES[match] });
    }
    return null;
  }
);
var FormCustomMessage = React.forwardRef(
  (props, forwardedRef) => {
    const { match, forceMatch = false, name, id: idProp, children, ...messageProps } = props;
    const validationContext = useValidationContext(MESSAGE_NAME, messageProps.__scopeForm);
    const ref = React.useRef(null);
    const composedRef = (0, import_react_compose_refs.useComposedRefs)(forwardedRef, ref);
    const _id = (0, import_react_id.useId)();
    const id = idProp ?? _id;
    const customMatcherEntry = React.useMemo(() => ({ id, match }), [id, match]);
    const { onFieldCustomMatcherEntryAdd, onFieldCustomMatcherEntryRemove } = validationContext;
    React.useEffect(() => {
      onFieldCustomMatcherEntryAdd(name, customMatcherEntry);
      return () => onFieldCustomMatcherEntryRemove(name, customMatcherEntry.id);
    }, [customMatcherEntry, name, onFieldCustomMatcherEntryAdd, onFieldCustomMatcherEntryRemove]);
    const validity = validationContext.getFieldValidity(name);
    const customErrors = validationContext.getFieldCustomErrors(name);
    const hasMatchingCustomError = customErrors[id];
    const matches = forceMatch || validity && !hasBuiltInError(validity) && hasMatchingCustomError;
    if (matches) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormMessageImpl, { id, ref: composedRef, ...messageProps, name, children: children ?? DEFAULT_INVALID_MESSAGE });
    }
    return null;
  }
);
var FormMessageImpl = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeForm, id: idProp, name, ...messageProps } = props;
    const ariaDescriptionContext = useAriaDescriptionContext(MESSAGE_NAME, __scopeForm);
    const _id = (0, import_react_id.useId)();
    const id = idProp ?? _id;
    const { onFieldMessageIdAdd, onFieldMessageIdRemove } = ariaDescriptionContext;
    React.useEffect(() => {
      onFieldMessageIdAdd(name, id);
      return () => onFieldMessageIdRemove(name, id);
    }, [name, id, onFieldMessageIdAdd, onFieldMessageIdRemove]);
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react_primitive.Primitive.span, { id, ...messageProps, ref: forwardedRef });
  }
);
var VALIDITY_STATE_NAME = "FormValidityState";
var FormValidityState = (props) => {
  const { __scopeForm, name: nameProp, children } = props;
  const validationContext = useValidationContext(VALIDITY_STATE_NAME, __scopeForm);
  const fieldContext = useFormFieldContext(VALIDITY_STATE_NAME, __scopeForm);
  const name = nameProp ?? fieldContext.name;
  const validity = validationContext.getFieldValidity(name);
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: children(validity) });
};
FormValidityState.displayName = VALIDITY_STATE_NAME;
var SUBMIT_NAME = "FormSubmit";
var FormSubmit = React.forwardRef(
  (props, forwardedRef) => {
    const { __scopeForm, ...submitProps } = props;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react_primitive.Primitive.button, { type: "submit", ...submitProps, ref: forwardedRef });
  }
);
FormSubmit.displayName = SUBMIT_NAME;
function validityStateToObject(validity) {
  const object = {};
  for (const key in validity) {
    object[key] = validity[key];
  }
  return object;
}
function isHTMLElement(element) {
  return element instanceof HTMLElement;
}
function isFormControl(element) {
  return "validity" in element;
}
function isInvalid(control) {
  return isFormControl(control) && (control.validity.valid === false || control.getAttribute("aria-invalid") === "true");
}
function getFirstInvalidControl(form) {
  const elements = form.elements;
  const [firstInvalidControl] = Array.from(elements).filter(isHTMLElement).filter(isInvalid);
  return firstInvalidControl;
}
function isAsyncCustomMatcherEntry(entry, args) {
  return entry.match.constructor.name === "AsyncFunction" || returnsPromise(entry.match, args);
}
function isSyncCustomMatcherEntry(entry) {
  return entry.match.constructor.name === "Function";
}
function returnsPromise(func, args) {
  return func(...args) instanceof Promise;
}
function hasBuiltInError(validity) {
  let error = false;
  for (const validityKey in validity) {
    const key = validityKey;
    if (key !== "valid" && key !== "customError" && validity[key]) {
      error = true;
      break;
    }
  }
  return error;
}
function getValidAttribute(validity, serverInvalid) {
  if (validity?.valid === true && !serverInvalid) return true;
  return void 0;
}
function getInvalidAttribute(validity, serverInvalid) {
  if (validity?.valid === false || serverInvalid) return true;
  return void 0;
}
var Root = Form;
var Field = FormField;
var Label = FormLabel;
var Control = FormControl;
var Message = FormMessage;
var ValidityState = FormValidityState;
var Submit = FormSubmit;
//# sourceMappingURL=index.js.map
