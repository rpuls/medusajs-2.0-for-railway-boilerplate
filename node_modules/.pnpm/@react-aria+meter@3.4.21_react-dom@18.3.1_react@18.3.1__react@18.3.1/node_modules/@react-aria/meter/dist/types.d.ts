import { AriaMeterProps } from "@react-types/meter";
import { DOMAttributes } from "@react-types/shared";
export interface MeterAria {
    /** Props for the meter container element. */
    meterProps: DOMAttributes;
    /** Props for the meter's visual label (if any). */
    labelProps: DOMAttributes;
}
/**
 * Provides the accessibility implementation for a meter component.
 * Meters represent a quantity within a known range, or a fractional value.
 */
export function useMeter(props: AriaMeterProps): MeterAria;
export type { AriaMeterProps } from '@react-types/meter';

//# sourceMappingURL=types.d.ts.map
