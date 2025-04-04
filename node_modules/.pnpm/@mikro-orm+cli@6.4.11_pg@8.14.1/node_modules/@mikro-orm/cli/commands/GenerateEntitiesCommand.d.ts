import type { ArgumentsCamelCase, Argv } from 'yargs';
import type { BaseArgs, BaseCommand } from '../CLIConfigurator';
export type GenerateEntitiesArgs = BaseArgs & {
    dump?: boolean;
    save?: boolean;
    path?: string;
    schema?: string;
};
export declare class GenerateEntitiesCommand implements BaseCommand<GenerateEntitiesArgs> {
    command: string;
    describe: string;
    /**
     * @inheritDoc
     */
    builder(args: Argv): Argv<GenerateEntitiesArgs>;
    /**
     * @inheritDoc
     */
    handler(args: ArgumentsCamelCase<GenerateEntitiesArgs>): Promise<void>;
}
