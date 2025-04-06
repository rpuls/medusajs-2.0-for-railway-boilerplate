/**
 * Formats an amount based on currency code and locale
 * @param amount - the amount to format
 * @param currency_code - the currency code to use for formatting
 * @param locale - the locale to use for formatting
 * @returns formatted amount
 */
export const formatAmount = (
  amount: number,
  currency_code: string = "usd",
  locale: string = "en-US"
): string => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency_code,
  }).format(amount / 100);
};

/**
 * Converts a decimal number to a percentage
 * @param value - the decimal to convert
 * @returns the decimal as a percentage
 */
export const percentageToDecimal = (value: number): number => {
  return value / 100;
};

/**
 * Calculates the amount with a given percentage discount
 * @param amount - the amount to calculate from
 * @param discount - the percentage discount to apply
 * @returns the discounted amount
 */
export const calculateDiscountedAmount = (
  amount: number,
  discount: number
): number => {
  return amount - amount * (discount / 100);
};
