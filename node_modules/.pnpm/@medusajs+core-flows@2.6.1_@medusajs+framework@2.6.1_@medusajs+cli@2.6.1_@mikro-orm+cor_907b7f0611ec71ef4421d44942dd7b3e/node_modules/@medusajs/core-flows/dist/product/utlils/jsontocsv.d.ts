export interface ConvertJsonToCsvOptions<T> {
    sortHeader?: boolean | ((aKey: string, bKey: string) => number);
}
export declare const convertJsonToCsv: <T extends object>(data: T[], options?: ConvertJsonToCsvOptions<T>) => string;
//# sourceMappingURL=jsontocsv.d.ts.map