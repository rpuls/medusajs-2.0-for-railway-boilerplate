"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UmzugCLI = exports.CreateAction = exports.ListAction = exports.DownAction = exports.UpAction = void 0;
const cli = __importStar(require("@rushstack/ts-command-line"));
class UpAction extends cli.CommandLineAction {
    constructor(umzug) {
        super({
            actionName: 'up',
            summary: 'Applies pending migrations',
            documentation: 'Performs all migrations. See --help for more options',
        });
        this.umzug = umzug;
    }
    static _defineParameters(action) {
        return {
            to: action.defineStringParameter({
                parameterLongName: '--to',
                argumentName: 'NAME',
                description: `All migrations up to and including this one should be applied`,
            }),
            step: action.defineIntegerParameter({
                parameterLongName: '--step',
                argumentName: 'COUNT',
                description: `Apply this many migrations. If not specified, all will be applied.`,
            }),
            name: action.defineStringListParameter({
                parameterLongName: '--name',
                argumentName: 'MIGRATION',
                description: `Explicity declare migration name(s) to be applied. Only these migrations will be applied.`,
            }),
            rerun: action.defineChoiceParameter({
                parameterLongName: '--rerun',
                description: `Specify what action should be taken when a migration that has already been applied is passed to --name.`,
                alternatives: ['THROW', 'SKIP', 'ALLOW'],
                defaultValue: 'THROW',
            }),
        };
    }
    onDefineParameters() {
        this._params = UpAction._defineParameters(this);
    }
    async onExecute() {
        var _a;
        const { to: { value: to }, step: { value: step }, name: { values: nameArray }, rerun: { value: rerun }, } = this._params;
        // string list parameters are always defined. When they're empty it means nothing was passed.
        const migrations = nameArray.length > 0 ? nameArray : undefined;
        if (to && migrations) {
            throw new Error(`Can't specify 'to' and 'name' together`);
        }
        if (to && typeof step === 'number') {
            throw new Error(`Can't specify 'to' and 'step' together`);
        }
        if (typeof step === 'number' && migrations) {
            throw new Error(`Can't specify 'step' and 'name' together`);
        }
        if (rerun !== 'THROW' && !migrations) {
            throw new Error(`Can't specify 'rerun' without 'name'`);
        }
        const result = await this.umzug.up({ to, step, migrations, rerun });
        (_a = this.umzug.options.logger) === null || _a === void 0 ? void 0 : _a.info({ event: this.actionName, message: `applied ${result.length} migrations.` });
    }
}
exports.UpAction = UpAction;
class DownAction extends cli.CommandLineAction {
    constructor(umzug) {
        super({
            actionName: 'down',
            summary: 'Revert migrations',
            documentation: 'Undoes previously-applied migrations. By default, undoes the most recent migration only. Use --help for more options. Useful in development to start from a clean slate. Use with care in production!',
        });
        this.umzug = umzug;
    }
    static _defineParameters(action) {
        return {
            to: action.defineStringParameter({
                parameterLongName: '--to',
                argumentName: 'NAME',
                description: `All migrations up to and including this one should be reverted. Pass '0' to revert all.`,
            }),
            step: action.defineIntegerParameter({
                parameterLongName: '--step',
                argumentName: 'COUNT',
                description: `Revert this many migrations. If not specified, only the most recent migration will be reverted.`,
            }),
            name: action.defineStringListParameter({
                parameterLongName: '--name',
                argumentName: 'MIGRATION',
                description: `Explicity declare migration name(s) to be reverted. Only these migrations will be reverted.`,
            }),
            // todo: come up with a better word for this
            rerun: action.defineChoiceParameter({
                parameterLongName: '--rerun',
                description: `Specify what action should be taken when a migration that has already been applied is passed to --name.`,
                alternatives: ['THROW', 'SKIP', 'ALLOW'],
                defaultValue: 'THROW',
            }),
        };
    }
    onDefineParameters() {
        this._params = DownAction._defineParameters(this);
    }
    async onExecute() {
        var _a;
        const { to: { value: to }, step: { value: step }, name: { values: nameArray }, rerun: { value: rerun }, } = this._params;
        // string list parameters are always defined. When they're empty it means nothing was passed.
        const migrations = nameArray.length > 0 ? nameArray : undefined;
        if (to && migrations) {
            throw new Error(`Can't specify 'to' and 'name' together`);
        }
        if (to && typeof step === 'number') {
            throw new Error(`Can't specify 'to' and 'step' together`);
        }
        if (typeof step === 'number' && migrations) {
            throw new Error(`Can't specify 'step' and 'name' together`);
        }
        if (rerun !== 'THROW' && !migrations) {
            throw new Error(`Can't specify 'rerun' without 'name'`);
        }
        const result = await this.umzug.down({
            to: to === '0' ? 0 : to,
            step,
            migrations,
            rerun,
        });
        (_a = this.umzug.options.logger) === null || _a === void 0 ? void 0 : _a.info({ event: this.actionName, message: `reverted ${result.length} migrations.` });
    }
}
exports.DownAction = DownAction;
class ListAction extends cli.CommandLineAction {
    constructor(action, umzug) {
        super({
            actionName: action,
            summary: `Lists ${action} migrations`,
            documentation: `Prints migrations returned by \`umzug.${action}()\`. By default, prints migration names one per line.`,
        });
        this.action = action;
        this.umzug = umzug;
    }
    static _defineParameters(action) {
        return {
            json: action.defineFlagParameter({
                parameterLongName: '--json',
                description: `Print ${action.actionName} migrations in a json format including names and paths. This allows piping output to tools like jq. ` +
                    `Without this flag, the migration names will be printed one per line.`,
            }),
        };
    }
    onDefineParameters() {
        this._params = ListAction._defineParameters(this);
    }
    async onExecute() {
        const migrations = await this.umzug[this.action]();
        const formatted = this._params.json.value
            ? JSON.stringify(migrations, null, 2)
            : migrations.map(m => m.name).join('\n');
        // eslint-disable-next-line no-console
        console.log(formatted);
    }
}
exports.ListAction = ListAction;
class CreateAction extends cli.CommandLineAction {
    constructor(umzug) {
        super({
            actionName: 'create',
            summary: 'Create a migration file',
            documentation: 'Generates a placeholder migration file using a timestamp as a prefix. By default, mimics the last existing migration, or guesses where to generate the file if no migration exists yet.',
        });
        this.umzug = umzug;
    }
    static _defineParameters(action) {
        return {
            name: action.defineStringParameter({
                parameterLongName: '--name',
                argumentName: 'NAME',
                description: `The name of the migration file. e.g. my-migration.js, my-migration.ts or my-migration.sql. Note - a prefix will be added to this name, usually based on a timestamp. See --prefix`,
                required: true,
            }),
            prefix: action.defineChoiceParameter({
                parameterLongName: '--prefix',
                description: 'The prefix format for generated files. TIMESTAMP uses a second-resolution timestamp, DATE uses a day-resolution timestamp, and NONE removes the prefix completely',
                alternatives: ['TIMESTAMP', 'DATE', 'NONE'],
                defaultValue: 'TIMESTAMP',
            }),
            folder: action.defineStringParameter({
                parameterLongName: '--folder',
                argumentName: 'PATH',
                description: `Path on the filesystem where the file should be created. The new migration will be created as a sibling of the last existing one if this is omitted.`,
            }),
            allowExtension: action.defineStringListParameter({
                parameterLongName: '--allow-extension',
                argumentName: 'EXTENSION',
                environmentVariable: 'UMZUG_ALLOW_EXTENSION',
                description: `Allowable extension for created files. By default .js, .ts and .sql files can be created. To create txt file migrations, for example, you could use '--name my-migration.txt --allow-extension .txt'`,
            }),
            skipVerify: action.defineFlagParameter({
                parameterLongName: '--skip-verify',
                description: `By default, the generated file will be checked after creation to make sure it is detected as a pending migration. This catches problems like creation in the wrong folder, or invalid naming conventions. ` +
                    `This flag bypasses that verification step.`,
            }),
            allowConfusingOrdering: action.defineFlagParameter({
                parameterLongName: '--allow-confusing-ordering',
                description: `By default, an error will be thrown if you try to create a migration that will run before a migration that already exists. ` +
                    `This catches errors which can cause problems if you change file naming conventions. ` +
                    `If you use a custom ordering system, you can disable this behavior, but it's strongly recommended that you don't! ` +
                    `If you're unsure, just ignore this option.`,
            }),
        };
    }
    onDefineParameters() {
        this._params = CreateAction._defineParameters(this);
    }
    async onExecute() {
        await this.umzug
            .create({
            name: this._params.name.value,
            prefix: this._params.prefix.value,
            folder: this._params.folder.value,
            allowExtension: this._params.allowExtension.values.length > 0 ? this._params.allowExtension.values[0] : undefined,
            allowConfusingOrdering: this._params.allowConfusingOrdering.value,
            skipVerify: this._params.skipVerify.value,
        })
            .catch((e) => {
            Object.entries(this._params)
                .filter(entry => entry[0] !== 'name')
                .forEach(([name, param]) => {
                var _a;
                // replace `skipVerify` in error messages with `--skip-verify`, etc.
                e.message = (_a = e.message) === null || _a === void 0 ? void 0 : _a.split(name).join(param.longName);
            });
            throw e;
        });
    }
}
exports.CreateAction = CreateAction;
class UmzugCLI extends cli.CommandLineParser {
    constructor(umzug, commandLineParserOptions = {}) {
        var _a, _b;
        super({
            toolFilename: (_a = commandLineParserOptions.toolFileName) !== null && _a !== void 0 ? _a : '<script>',
            toolDescription: (_b = commandLineParserOptions.toolDescription) !== null && _b !== void 0 ? _b : 'Umzug migrator',
        });
        this.umzug = umzug;
        this.addAction(new UpAction(umzug));
        this.addAction(new DownAction(umzug));
        this.addAction(new ListAction('pending', umzug));
        this.addAction(new ListAction('executed', umzug));
        this.addAction(new CreateAction(umzug));
    }
    onDefineParameters() { }
}
exports.UmzugCLI = UmzugCLI;
//# sourceMappingURL=cli.js.map