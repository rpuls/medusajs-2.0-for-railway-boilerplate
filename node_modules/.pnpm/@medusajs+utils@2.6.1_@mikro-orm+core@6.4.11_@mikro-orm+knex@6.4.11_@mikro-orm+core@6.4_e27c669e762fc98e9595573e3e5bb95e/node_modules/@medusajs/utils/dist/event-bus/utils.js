"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildModuleResourceEventName = buildModuleResourceEventName;
exports.buildEventNamesFromEntityName = buildEventNamesFromEntityName;
const common_1 = require("../common");
const common_events_1 = require("./common-events");
/**
 * Build a conventional event name from the object name and the action and the prefix if provided
 * @param prefix
 * @param objectName
 * @param action
 */
function buildModuleResourceEventName({ prefix, objectName, action, }) {
    const kebabCaseName = (0, common_1.lowerCaseFirst)((0, common_1.kebabCase)(objectName));
    return `${prefix ? `${prefix}.` : ""}${kebabCaseName}.${action}`;
}
/**
 * From the given strings it will produce the event names accordingly.
 * the result will look like:
 * input: 'serviceZone'
 * output: {
 *   SERVICE_ZONE_CREATED: 'service-zone.created',
 *   SERVICE_ZONE_UPDATED: 'service-zone.updated',
 *   SERVICE_ZONE_DELETED: 'service-zone.deleted',
 *   SERVICE_ZONE_RESTORED: 'service-zone.restored',
 *   SERVICE_ZONE_ATTACHED: 'service-zone.attached',
 *   SERVICE_ZONE_DETACHED: 'service-zone.detached',
 *   ...
 * }
 *
 * @param names
 * @param prefix
 */
function buildEventNamesFromEntityName(names, prefix) {
    const events = {};
    for (let i = 0; i < names.length; i++) {
        const name = names[i];
        const snakedCaseName = (0, common_1.camelToSnakeCase)(name).toUpperCase();
        for (const event of Object.values(common_events_1.CommonEvents)) {
            const upperCasedEvent = event.toUpperCase();
            events[`${snakedCaseName}_${upperCasedEvent}`] =
                buildModuleResourceEventName({
                    prefix,
                    objectName: name,
                    action: event,
                });
        }
    }
    return events;
}
//# sourceMappingURL=utils.js.map