import { AriaProgressBarProps } from "@react-types/progress";
import { DOMAttributes } from "@react-types/shared";
export interface ProgressBarAria {
    /** Props for the progress bar container element. */
    progressBarProps: DOMAttributes;
    /** Props for the progress bar's visual label element (if any). */
    labelProps: DOMAttributes;
}
/**
 * Provides the accessibility implementation for a progress bar component.
 * Progress bars show either determinate or indeterminate progress of an operation
 * over time.
 */
export function useProgressBar(props: AriaProgressBarProps): ProgressBarAria;
export type { AriaProgressBarProps } from '@react-types/progress';

//# sourceMappingURL=types.d.ts.map
