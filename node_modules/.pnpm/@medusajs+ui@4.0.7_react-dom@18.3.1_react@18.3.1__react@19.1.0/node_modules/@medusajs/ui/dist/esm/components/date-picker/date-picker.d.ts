import { CalendarDate, CalendarDateTime } from "@internationalized/date";
import * as React from "react";
import { type AriaDatePickerProps as BaseDatePickerProps } from "react-aria";
import { Granularity } from "../../types";
type DatePickerValueProps = {
    defaultValue?: Date | null;
    value?: Date | null;
    onChange?: (value: Date | null) => void;
    isDateUnavailable?: (date: Date) => boolean;
    minValue?: Date;
    maxValue?: Date;
    shouldCloseOnSelect?: boolean;
    granularity?: Granularity;
    size?: "base" | "small";
    className?: string;
    modal?: boolean;
};
interface DatePickerProps extends Omit<BaseDatePickerProps<CalendarDateTime | CalendarDate>, keyof DatePickerValueProps>, DatePickerValueProps {
}
declare const DatePicker: React.ForwardRefExoticComponent<DatePickerProps & React.RefAttributes<HTMLDivElement>>;
export { DatePicker, type Granularity };
//# sourceMappingURL=date-picker.d.ts.map