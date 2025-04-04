import type { ArgumentsCamelCase } from 'yargs';
import type { BaseArgs, BaseCommand } from '../CLIConfigurator';
type ImportArgs = BaseArgs & {
    file: string;
};
export declare class ImportCommand implements BaseCommand<ImportArgs> {
    command: string;
    describe: string;
    /**
     * @inheritDoc
     */
    handler(args: ArgumentsCamelCase<ImportArgs>): Promise<void>;
}
export {};
