import { BigNumberInput } from "@medusajs/framework/types";
/**
 * Converts an amount to the format required by Stripe based on currency.
 * https://docs.stripe.com/currencies
 * @param {BigNumberInput} amount - The amount to be converted.
 * @param {string} currency - The currency code (e.g., 'USD', 'JOD').
 * @returns {number} - The converted amount in the smallest currency unit.
 */
export declare function getSmallestUnit(amount: BigNumberInput, currency: string): number;
/**
 * Converts an amount from the smallest currency unit to the standard unit based on currency.
 * @param {BigNumberInput} amount - The amount in the smallest currency unit.
 * @param {string} currency - The currency code (e.g., 'USD', 'JOD').
 * @returns {number} - The converted amount in the standard currency unit.
 */
export declare function getAmountFromSmallestUnit(amount: BigNumberInput, currency: string): number;
//# sourceMappingURL=get-smallest-unit.d.ts.map