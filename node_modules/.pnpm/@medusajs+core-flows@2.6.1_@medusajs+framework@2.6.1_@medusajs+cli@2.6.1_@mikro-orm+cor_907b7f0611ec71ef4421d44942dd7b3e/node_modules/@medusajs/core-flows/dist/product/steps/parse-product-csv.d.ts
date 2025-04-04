/**
 * The CSV file content to parse.
 */
export type ParseProductCsvStepInput = string;
export declare const parseProductCsvStepId = "parse-product-csv";
/**
 * This step parses a CSV file holding products to import, returning the products as
 * objects that can be imported.
 *
 * @example
 * const data = parseProductCsvStep("products.csv")
 */
export declare const parseProductCsvStep: import("@medusajs/framework/workflows-sdk").StepFunction<string, import("@medusajs/framework/types").AdminCreateProduct[]>;
//# sourceMappingURL=parse-product-csv.d.ts.map