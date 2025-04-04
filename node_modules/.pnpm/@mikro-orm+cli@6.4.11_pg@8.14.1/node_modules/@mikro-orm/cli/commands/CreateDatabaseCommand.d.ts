import type { ArgumentsCamelCase } from 'yargs';
import type { BaseArgs, BaseCommand } from '../CLIConfigurator';
export declare class CreateDatabaseCommand implements BaseCommand {
    command: string;
    describe: string;
    /**
     * @inheritDoc
     */
    handler(args: ArgumentsCamelCase<BaseArgs>): Promise<void>;
}
