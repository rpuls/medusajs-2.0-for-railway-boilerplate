import * as react_jsx_runtime from 'react/jsx-runtime';
import * as _radix_ui_react_context from '@radix-ui/react-context';
import { Scope } from '@radix-ui/react-context';
import * as React from 'react';
import { Label as Label$1 } from '@radix-ui/react-label';
import { Primitive } from '@radix-ui/react-primitive';

type ScopedProps<P> = P & {
    __scopeForm?: Scope;
};
declare const createFormScope: _radix_ui_react_context.CreateScope;
type PrimitiveFormProps = React.ComponentPropsWithoutRef<typeof Primitive.form>;
interface FormProps extends PrimitiveFormProps {
    onClearServerErrors?(): void;
}
declare const Form: React.ForwardRefExoticComponent<FormProps & React.RefAttributes<HTMLFormElement>>;
type PrimitiveDivProps = React.ComponentPropsWithoutRef<typeof Primitive.div>;
interface FormFieldProps extends PrimitiveDivProps {
    name: string;
    serverInvalid?: boolean;
}
declare const FormField: React.ForwardRefExoticComponent<FormFieldProps & React.RefAttributes<HTMLDivElement>>;
type LabelProps = React.ComponentPropsWithoutRef<typeof Label$1>;
interface FormLabelProps extends LabelProps {
}
declare const FormLabel: React.ForwardRefExoticComponent<FormLabelProps & React.RefAttributes<HTMLLabelElement>>;
type PrimitiveInputProps = React.ComponentPropsWithoutRef<typeof Primitive.input>;
interface FormControlProps extends PrimitiveInputProps {
}
declare const FormControl: React.ForwardRefExoticComponent<FormControlProps & React.RefAttributes<HTMLInputElement>>;
declare const validityMatchers: readonly ["badInput", "patternMismatch", "rangeOverflow", "rangeUnderflow", "stepMismatch", "tooLong", "tooShort", "typeMismatch", "valid", "valueMissing"];
type ValidityMatcher = (typeof validityMatchers)[number];
interface FormMessageProps extends Omit<FormMessageImplProps, 'name'> {
    match?: ValidityMatcher | CustomMatcher;
    forceMatch?: boolean;
    name?: string;
}
declare const FormMessage: React.ForwardRefExoticComponent<FormMessageProps & React.RefAttributes<HTMLSpanElement>>;
type PrimitiveSpanProps = React.ComponentPropsWithoutRef<typeof Primitive.span>;
interface FormMessageImplProps extends PrimitiveSpanProps {
    name: string;
}
interface FormValidityStateProps {
    children(validity: ValidityState | undefined): React.ReactNode;
    name?: string;
}
declare const FormValidityState: {
    (props: ScopedProps<FormValidityStateProps>): react_jsx_runtime.JSX.Element;
    displayName: string;
};
type PrimitiveButtonProps = React.ComponentPropsWithoutRef<typeof Primitive.button>;
interface FormSubmitProps extends PrimitiveButtonProps {
}
declare const FormSubmit: React.ForwardRefExoticComponent<FormSubmitProps & React.RefAttributes<HTMLButtonElement>>;
type SyncCustomMatcher = (value: string, formData: FormData) => boolean;
type AsyncCustomMatcher = (value: string, formData: FormData) => Promise<boolean>;
type CustomMatcher = SyncCustomMatcher | AsyncCustomMatcher;
declare const Root: React.ForwardRefExoticComponent<FormProps & React.RefAttributes<HTMLFormElement>>;
declare const Field: React.ForwardRefExoticComponent<FormFieldProps & React.RefAttributes<HTMLDivElement>>;
declare const Label: React.ForwardRefExoticComponent<FormLabelProps & React.RefAttributes<HTMLLabelElement>>;
declare const Control: React.ForwardRefExoticComponent<FormControlProps & React.RefAttributes<HTMLInputElement>>;
declare const Message: React.ForwardRefExoticComponent<FormMessageProps & React.RefAttributes<HTMLSpanElement>>;
declare const ValidityState: {
    (props: ScopedProps<FormValidityStateProps>): react_jsx_runtime.JSX.Element;
    displayName: string;
};
declare const Submit: React.ForwardRefExoticComponent<FormSubmitProps & React.RefAttributes<HTMLButtonElement>>;

export { Control, Field, Form, FormControl, type FormControlProps, FormField, type FormFieldProps, FormLabel, type FormLabelProps, FormMessage, type FormMessageProps, type FormProps, FormSubmit, type FormSubmitProps, FormValidityState, type FormValidityStateProps, Label, Message, Root, Submit, ValidityState, createFormScope };
