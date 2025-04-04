import * as React from "react";
import { useButton } from "react-aria";
import { IconButton } from "../icon-button";
const CalendarButton = React.forwardRef(({ children, ...props }, ref) => {
    const innerRef = React.useRef(null);
    React.useImperativeHandle(ref, () => innerRef.current);
    const { buttonProps } = useButton(props, innerRef);
    return (React.createElement(IconButton, { size: "small", variant: "transparent", className: "rounded-[4px]", ...buttonProps }, children));
});
CalendarButton.displayName = "CalendarButton";
export { CalendarButton };
//# sourceMappingURL=calendar-button.js.map