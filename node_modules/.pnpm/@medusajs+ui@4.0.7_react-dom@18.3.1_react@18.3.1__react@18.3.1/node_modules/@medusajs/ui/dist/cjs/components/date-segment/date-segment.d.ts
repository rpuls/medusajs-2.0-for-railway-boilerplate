import * as React from "react";
import { DateFieldState, DateSegment as Segment } from "react-stately";
interface DateSegmentProps extends React.ComponentPropsWithoutRef<"div"> {
    segment: Segment;
    state: DateFieldState;
}
declare const DateSegment: ({ segment, state }: DateSegmentProps) => React.JSX.Element;
export { DateSegment };
//# sourceMappingURL=date-segment.d.ts.map