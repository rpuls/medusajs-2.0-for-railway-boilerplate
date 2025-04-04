import type { ArgumentsCamelCase, Argv } from 'yargs';
import type { BaseArgs } from '../CLIConfigurator';
export declare class MigrationCommandFactory {
    static readonly DESCRIPTIONS: {
        create: string;
        up: string;
        down: string;
        list: string;
        check: string;
        pending: string;
        fresh: string;
    };
    static create<const T extends MigratorMethod>(command: T): {
        command: string;
        describe: {
            create: string;
            up: string;
            down: string;
            list: string;
            check: string;
            pending: string;
            fresh: string;
        }[T];
        builder: (args: Argv<BaseArgs>) => Argv<MigrationOptionsMap[T]>;
        handler: (args: ArgumentsCamelCase<MigrationOptionsMap[T]>) => Promise<void>;
    };
    static configureMigrationCommand<const T extends MigratorMethod>(args: Argv<BaseArgs>, method: T): Argv<MigrationOptionsMap[T]>;
    private static configureUpDownCommand;
    private static configureCreateCommand;
    static handleMigrationCommand(args: ArgumentsCamelCase<Opts>, method: MigratorMethod): Promise<void>;
    private static configureFreshCommand;
    private static handleUpDownCommand;
    private static handlePendingCommand;
    private static handleListCommand;
    private static handleCreateCommand;
    private static handleCheckCommand;
    private static handleFreshCommand;
    private static getUpDownOptions;
    private static getUpDownSuccessMessage;
}
type CliUpDownOptions = BaseArgs & {
    to?: string | number;
    from?: string | number;
    only?: string;
};
type MigratorFreshOptions = BaseArgs & {
    dropDb?: boolean;
    seed?: string;
};
type MigratorCreateOptions = BaseArgs & {
    blank?: boolean;
    initial?: boolean;
    path?: string;
    dump?: boolean;
    name?: string;
};
type MigrationOptionsMap = {
    create: MigratorCreateOptions;
    check: BaseArgs;
    up: CliUpDownOptions;
    down: CliUpDownOptions;
    list: BaseArgs;
    pending: BaseArgs;
    fresh: MigratorFreshOptions;
};
type MigratorMethod = keyof MigrationOptionsMap;
type Opts = BaseArgs & MigratorCreateOptions & CliUpDownOptions & MigratorFreshOptions;
export {};
