"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatRegistrationName = formatRegistrationName;
exports.formatRegistrationNameWithoutNamespace = formatRegistrationNameWithoutNamespace;
const path_1 = require("path");
const utils_1 = require("@medusajs/framework/utils");
/**
 * Formats a filename into the correct container resolution name.
 * Names are camelCase formatted and namespaced by the folder i.e:
 * models/example-person -> examplePersonModel
 * @param path - the full path of the file
 * @return the formatted name
 */
function formatRegistrationName(path) {
    const parsed = (0, path_1.parse)(path);
    const parsedDir = (0, path_1.parse)(parsed.dir);
    let directoryNamespace = parsedDir.name;
    if (directoryNamespace.startsWith("__")) {
        const parsedCoreDir = (0, path_1.parse)(parsedDir.dir);
        directoryNamespace = parsedCoreDir.name;
    }
    switch (directoryNamespace) {
        // We strip the last character when adding the type of registration
        // this is a trick for plural "ies"
        case "repositories":
            directoryNamespace = "repositorys";
            break;
        case "strategies":
            directoryNamespace = "strategys";
            break;
        default:
            break;
    }
    const upperNamespace = (0, utils_1.upperCaseFirst)(directoryNamespace.slice(0, -1));
    return formatRegistrationNameWithoutNamespace(path) + upperNamespace;
}
function formatRegistrationNameWithoutNamespace(path) {
    const parsed = (0, path_1.parse)(path);
    return (0, utils_1.toCamelCase)(parsed.name);
}
exports.default = formatRegistrationName;
//# sourceMappingURL=format-registration-name.js.map