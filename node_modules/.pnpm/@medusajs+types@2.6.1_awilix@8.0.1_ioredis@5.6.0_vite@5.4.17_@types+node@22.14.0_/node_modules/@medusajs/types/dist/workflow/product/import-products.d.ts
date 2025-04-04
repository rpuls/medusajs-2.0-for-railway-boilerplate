/**
 * The configurations to import products.
 */
export interface ImportProductsDTO {
    /**
     * The content of the CSV file.
     */
    fileContent: string;
    /**
     * The name of the CSV file.
     */
    filename: string;
}
export interface ImportProductsSummary {
    toCreate: number;
    toUpdate: number;
}
//# sourceMappingURL=import-products.d.ts.map