/**
 * A low-level utility to migrate the database. This util should
 * never exit the process implicitly.
 */
export declare function migrate({ directory, skipLinks, skipScripts, executeAllLinks, executeSafeLinks, }: {
    directory: string;
    skipLinks: boolean;
    skipScripts: boolean;
    executeAllLinks: boolean;
    executeSafeLinks: boolean;
}): Promise<boolean>;
declare const main: ({ directory, skipLinks, skipScripts, executeAllLinks, executeSafeLinks, }: {
    directory: any;
    skipLinks: any;
    skipScripts: any;
    executeAllLinks: any;
    executeSafeLinks: any;
}) => Promise<never>;
export default main;
//# sourceMappingURL=migrate.d.ts.map