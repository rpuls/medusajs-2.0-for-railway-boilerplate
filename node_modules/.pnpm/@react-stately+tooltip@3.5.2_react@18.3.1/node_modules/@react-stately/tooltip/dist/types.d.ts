import { TooltipTriggerProps } from "@react-types/tooltip";
export interface TooltipTriggerState {
    /** Whether the tooltip is currently showing. */
    isOpen: boolean;
    /**
     * Shows the tooltip. By default, the tooltip becomes visible after a delay
     * depending on a global warmup timer. The `immediate` option shows the
     * tooltip immediately instead.
     */
    open(immediate?: boolean): void;
    /** Hides the tooltip. */
    close(immediate?: boolean): void;
}
/**
 * Manages state for a tooltip trigger. Tracks whether the tooltip is open, and provides
 * methods to toggle this state. Ensures only one tooltip is open at a time and controls
 * the delay for showing a tooltip.
 */
export function useTooltipTriggerState(props?: TooltipTriggerProps): TooltipTriggerState;
export type { TooltipTriggerProps } from '@react-types/tooltip';

//# sourceMappingURL=types.d.ts.map
