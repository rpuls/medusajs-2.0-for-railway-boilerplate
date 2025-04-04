import * as React from "react";
import { DateValue, type CalendarProps } from "react-aria";
/**
 * InternalCalendar is the internal implementation of the Calendar component.
 * It's not for public use, but only used for other components like DatePicker.
 */
declare const InternalCalendar: <TDateValue extends DateValue>(props: CalendarProps<TDateValue>) => React.JSX.Element;
export { InternalCalendar };
//# sourceMappingURL=_internal-calendar.d.ts.map