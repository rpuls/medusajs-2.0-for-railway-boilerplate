import type { ArgumentsCamelCase, Argv } from 'yargs';
import type { BaseArgs, BaseCommand } from '../CLIConfigurator';
type CreateSeederCommandArgs = BaseArgs & {
    seeder: string;
};
export declare class CreateSeederCommand implements BaseCommand<CreateSeederCommandArgs> {
    command: string;
    describe: string;
    builder: (args: Argv<BaseArgs>) => Argv<CreateSeederCommandArgs>;
    /**
     * @inheritDoc
     */
    handler(args: ArgumentsCamelCase<CreateSeederCommandArgs>): Promise<void>;
    /**
     * Will return a seeder name that is formatted like this EntitySeeder
     */
    private static getSeederClassName;
}
export {};
