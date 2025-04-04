/**
 * A low-level utility to create the database. This util should
 * never exit the process implicitly.
 */
export declare function dbCreate({ db, directory, interactive, }: {
    db: string | undefined;
    directory: string;
    interactive: boolean;
}): Promise<boolean>;
declare const main: ({ directory, interactive, db }: {
    directory: any;
    interactive: any;
    db: any;
}) => Promise<never>;
export default main;
//# sourceMappingURL=create.d.ts.map