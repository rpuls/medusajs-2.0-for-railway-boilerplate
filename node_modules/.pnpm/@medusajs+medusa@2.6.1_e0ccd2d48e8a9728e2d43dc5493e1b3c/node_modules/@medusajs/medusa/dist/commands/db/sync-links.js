"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncLinks = syncLinks;
const boxen_1 = __importDefault(require("boxen"));
const chalk_1 = __importDefault(require("chalk"));
const path_1 = require("path");
const checkbox_1 = __importDefault(require("@inquirer/checkbox"));
const utils_1 = require("@medusajs/framework/utils");
const links_1 = require("@medusajs/framework/links");
const logger_1 = require("@medusajs/framework/logger");
const framework_1 = require("@medusajs/framework");
const utils_2 = require("../utils");
const loaders_1 = require("../../loaders");
const resolve_plugins_1 = require("../../loaders/helpers/resolve-plugins");
/**
 * Groups action tables by their "action" property
 * @param actionPlan LinkMigrationsPlannerAction
 */
function groupByActionPlan(actionPlan) {
    return actionPlan.reduce((acc, action) => {
        acc[action.action] ??= [];
        acc[action.action].push(action);
        return acc;
    }, {});
}
/**
 * Creates the link description for printing it to the
 * console
 *
 * @param action LinkMigrationsPlannerAction
 */
function buildLinkDescription(action) {
    const { linkDescriptor } = action;
    const from = chalk_1.default.yellow(`${linkDescriptor.fromModule}.${linkDescriptor.fromModel}`);
    const to = chalk_1.default.yellow(`${linkDescriptor.toModule}.${linkDescriptor.toModel}`);
    const table = chalk_1.default.dim(`(${action.tableName})`);
    return `${from} <> ${to} ${table}`;
}
/**
 * Logs the actions of a given action type with a nice border and
 * a title
 */
function logActions(title, actionsOrContext) {
    const actionsList = actionsOrContext
        .map((action) => `  - ${buildLinkDescription(action)}`)
        .join("\n");
    console.log((0, boxen_1.default)(`${title}\n${actionsList}`, { padding: 1 }));
}
/**
 * Displays a prompt to select tables that must be impacted with
 * action
 */
async function askForLinkActionsToPerform(message, actions) {
    console.log((0, boxen_1.default)(message, { borderColor: "red", padding: 1 }));
    return await (0, checkbox_1.default)({
        message: "Select tables to act upon",
        instructions: chalk_1.default.dim(" <space> select, <a> select all, <i> inverse, <enter> submit"),
        choices: actions.map((action) => {
            return {
                name: buildLinkDescription(action),
                value: action,
                checked: false,
            };
        }),
    });
}
/**
 * Low-level utility to sync links. This utility is used
 * by the migrate command as-well.
 */
async function syncLinks(medusaAppLoader, { executeAll, executeSafe, }) {
    const planner = await medusaAppLoader.getLinksExecutionPlanner();
    logger_1.logger.info("Syncing links...");
    const actionPlan = await planner.createPlan();
    const groupActionPlan = groupByActionPlan(actionPlan);
    if (groupActionPlan.delete?.length) {
        /**
         * Do not delete anything when "--execute-safe" flag
         * is used. And only prompt when "--execute-all"
         * flag isn't used either
         */
        if (executeSafe) {
            groupActionPlan.delete = [];
        }
        else if (!executeAll) {
            groupActionPlan.delete = await askForLinkActionsToPerform(`Select the tables to ${chalk_1.default.red("DELETE")}. The following links have been removed`, groupActionPlan.delete);
        }
    }
    if (groupActionPlan.notify?.length) {
        let answer = groupActionPlan.notify;
        /**
         * Do not update anything when "--execute-safe" flag
         * is used. And only prompt when "--execute-all"
         * flag isn't used either.
         */
        if (executeSafe) {
            answer = [];
        }
        else if (!executeAll) {
            answer = await askForLinkActionsToPerform(`Select the tables to ${chalk_1.default.red("UPDATE")}. The following links have been updated`, groupActionPlan.notify);
        }
        groupActionPlan.update ??= [];
        groupActionPlan.update.push(...answer.map((action) => {
            return {
                ...action,
                action: "update",
            };
        }));
    }
    const toCreate = groupActionPlan.create ?? [];
    const toUpdate = groupActionPlan.update ?? [];
    const toDelete = groupActionPlan.delete ?? [];
    const actionsToExecute = [...toCreate, ...toUpdate, ...toDelete];
    await planner.executePlan(actionsToExecute);
    if (toCreate.length) {
        logActions("Created following links tables", toCreate);
    }
    if (toUpdate.length) {
        logActions("Updated following links tables", toUpdate);
    }
    if (toDelete.length) {
        logActions("Deleted following links tables", toDelete);
    }
    if (actionsToExecute.length) {
        logger_1.logger.info("Links sync completed");
    }
    else {
        logger_1.logger.info("Database already up-to-date");
    }
}
const main = async function ({ directory, executeSafe, executeAll }) {
    try {
        const container = await (0, loaders_1.initializeContainer)(directory);
        await (0, utils_2.ensureDbExists)(container);
        const configModule = container.resolve(utils_1.ContainerRegistrationKeys.CONFIG_MODULE);
        const medusaAppLoader = new framework_1.MedusaAppLoader();
        const plugins = await (0, resolve_plugins_1.getResolvedPlugins)(directory, configModule, true);
        (0, utils_1.mergePluginModules)(configModule, plugins);
        const linksSourcePaths = plugins.map((plugin) => (0, path_1.join)(plugin.resolve, "links"));
        await new links_1.LinkLoader(linksSourcePaths).load();
        await syncLinks(medusaAppLoader, { executeAll, executeSafe });
        process.exit();
    }
    catch (error) {
        logger_1.logger.error(error);
        process.exit(1);
    }
};
exports.default = main;
//# sourceMappingURL=sync-links.js.map