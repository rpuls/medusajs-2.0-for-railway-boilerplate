export declare function transactionWrapper<TManager = unknown>(manager: any, task: (transactionManager: any) => Promise<any>, { transaction, isolationLevel, enableNestedTransactions, }?: {
    isolationLevel?: string;
    transaction?: TManager;
    enableNestedTransactions?: boolean;
}): Promise<any>;
export declare function normalizeMigrationSQL(sql: string): string;
//# sourceMappingURL=utils.d.ts.map