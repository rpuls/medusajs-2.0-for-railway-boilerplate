import * as React from "react";
import { AriaDatePickerProps, DateValue } from "react-aria";
interface DatePickerFieldProps extends AriaDatePickerProps<DateValue> {
    size?: "base" | "small";
}
declare const DatePickerField: ({ size, ...props }: DatePickerFieldProps) => React.JSX.Element;
export { DatePickerField };
//# sourceMappingURL=date-picker-field.d.ts.map