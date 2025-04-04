import type { ArgumentsCamelCase, Argv } from 'yargs';
import type { BaseArgs } from '../CLIConfigurator';
export declare class SchemaCommandFactory {
    static readonly DESCRIPTIONS: {
        readonly create: "Create database schema based on current metadata";
        readonly update: "Update database schema based on current metadata";
        readonly drop: "Drop database schema based on current metadata";
        readonly fresh: "Drop and recreate database schema based on current metadata";
    };
    static readonly SUCCESS_MESSAGES: {
        readonly create: "Schema successfully created";
        readonly update: "Schema successfully updated";
        readonly drop: "Schema successfully dropped";
        readonly fresh: "Schema successfully dropped and recreated";
    };
    static create<const T extends SchemaMethod>(command: T): {
        command: string;
        describe: "Create database schema based on current metadata" | "Update database schema based on current metadata" | "Drop database schema based on current metadata" | "Drop and recreate database schema based on current metadata";
        builder: (args: Argv<BaseArgs>) => Argv<OptionsMap[T]>;
        handler: (args: ArgumentsCamelCase<OptionsMap[T]>) => Promise<void>;
    };
    static configureSchemaCommand<const T extends SchemaMethod>(args: Argv<BaseArgs>, command: T): Argv<OptionsMap[T]>;
    static handleSchemaCommand(args: ArgumentsCamelCase<Options>, method: SchemaMethod, successMessage: string): Promise<void>;
}
type SchemaOptions = BaseArgs & {
    run?: boolean;
    schema?: string;
};
type NonFreshOptions = SchemaOptions & {
    dump?: boolean;
    fkChecks?: boolean;
};
export type SchemaCreateOptions = NonFreshOptions & {
    seed?: string;
};
export type SchemaUpdateOptions = NonFreshOptions & {
    safe?: boolean;
    dropTables?: boolean;
};
export type SchemaDropOptions = NonFreshOptions & {
    dropDb?: boolean;
};
export type SchemaFreshOptions = SchemaOptions & Omit<SchemaCreateOptions & SchemaDropOptions, keyof NonFreshOptions>;
type OptionsMap = {
    create: SchemaCreateOptions;
    update: SchemaUpdateOptions;
    drop: SchemaDropOptions;
    fresh: SchemaFreshOptions;
};
type SchemaMethod = keyof OptionsMap;
export type Options = SchemaCreateOptions & SchemaUpdateOptions & SchemaDropOptions & SchemaFreshOptions;
export {};
