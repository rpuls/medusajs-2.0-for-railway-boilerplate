import * as React from "react";
import { AriaButtonProps } from "react-aria";
interface CalendarButtonProps extends AriaButtonProps<"button"> {
    size?: "base" | "small";
}
declare const DatePickerButton: React.ForwardRefExoticComponent<CalendarButtonProps & React.RefAttributes<HTMLButtonElement>>;
export { DatePickerButton };
//# sourceMappingURL=date-picker-button.d.ts.map