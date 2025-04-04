#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('@jercle/yargonaut')
    .style('blue')
    .style('yellow', 'required')
    .helpStyle('green')
    .errorsStyle('red');
const CLIHelper_1 = require("./CLIHelper");
const CLIConfigurator_1 = require("./CLIConfigurator");
void (async () => {
    const argv = CLIConfigurator_1.CLIConfigurator.configure();
    const args = await argv.parse(process.argv.slice(2));
    if (args._.length === 0) {
        CLIHelper_1.CLIHelper.showHelp();
    }
})();
