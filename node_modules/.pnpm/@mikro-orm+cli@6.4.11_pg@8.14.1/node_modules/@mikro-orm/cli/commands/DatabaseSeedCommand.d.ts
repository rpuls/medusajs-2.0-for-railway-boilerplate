import type { ArgumentsCamelCase, Argv } from 'yargs';
import type { BaseArgs, BaseCommand } from '../CLIConfigurator';
type DatabaseSeedArgs = BaseArgs & {
    class?: string;
};
export declare class DatabaseSeedCommand implements BaseCommand<DatabaseSeedArgs> {
    command: string;
    describe: string;
    builder: (args: Argv<BaseArgs>) => Argv<DatabaseSeedArgs>;
    /**
     * @inheritDoc
     */
    handler(args: ArgumentsCamelCase<DatabaseSeedArgs>): Promise<void>;
}
export {};
