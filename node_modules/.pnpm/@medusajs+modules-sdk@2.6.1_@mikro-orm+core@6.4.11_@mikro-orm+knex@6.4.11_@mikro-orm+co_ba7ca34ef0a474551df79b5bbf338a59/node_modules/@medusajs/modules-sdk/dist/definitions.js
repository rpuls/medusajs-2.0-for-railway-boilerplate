"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MODULE_DEFINITIONS = exports.ModulesDefinition = void 0;
const utils_1 = require("@medusajs/utils");
const types_1 = require("./types");
exports.ModulesDefinition = {
    [utils_1.Modules.EVENT_BUS]: {
        key: utils_1.Modules.EVENT_BUS,
        defaultPackage: utils_1.MODULE_PACKAGE_NAMES[utils_1.Modules.EVENT_BUS],
        label: (0, utils_1.upperCaseFirst)(utils_1.Modules.EVENT_BUS),
        isRequired: true,
        isQueryable: false,
        dependencies: [utils_1.ContainerRegistrationKeys.LOGGER],
        defaultModuleDeclaration: {
            scope: types_1.MODULE_SCOPE.INTERNAL,
        },
    },
    [utils_1.Modules.STOCK_LOCATION]: {
        key: utils_1.Modules.STOCK_LOCATION,
        defaultPackage: false,
        label: (0, utils_1.upperCaseFirst)(utils_1.Modules.STOCK_LOCATION),
        isRequired: false,
        isQueryable: true,
        dependencies: [utils_1.Modules.EVENT_BUS],
        defaultModuleDeclaration: {
            scope: types_1.MODULE_SCOPE.INTERNAL,
        },
    },
    [utils_1.Modules.INVENTORY]: {
        key: utils_1.Modules.INVENTORY,
        defaultPackage: false,
        label: (0, utils_1.upperCaseFirst)(utils_1.Modules.INVENTORY),
        isRequired: false,
        isQueryable: true,
        dependencies: [utils_1.Modules.EVENT_BUS],
        defaultModuleDeclaration: {
            scope: types_1.MODULE_SCOPE.INTERNAL,
        },
    },
    [utils_1.Modules.CACHE]: {
        key: utils_1.Modules.CACHE,
        defaultPackage: utils_1.MODULE_PACKAGE_NAMES[utils_1.Modules.CACHE],
        label: (0, utils_1.upperCaseFirst)(utils_1.Modules.CACHE),
        isRequired: true,
        isQueryable: false,
        defaultModuleDeclaration: {
            scope: types_1.MODULE_SCOPE.INTERNAL,
        },
    },
    [utils_1.Modules.PRODUCT]: {
        key: utils_1.Modules.PRODUCT,
        defaultPackage: false,
        label: (0, utils_1.upperCaseFirst)(utils_1.Modules.PRODUCT),
        isRequired: false,
        isQueryable: true,
        dependencies: [utils_1.Modules.EVENT_BUS, utils_1.ContainerRegistrationKeys.LOGGER],
        defaultModuleDeclaration: {
            scope: types_1.MODULE_SCOPE.INTERNAL,
        },
    },
    [utils_1.Modules.PRICING]: {
        key: utils_1.Modules.PRICING,
        defaultPackage: false,
        label: (0, utils_1.upperCaseFirst)(utils_1.Modules.PRICING),
        isRequired: false,
        isQueryable: true,
        dependencies: [utils_1.Modules.EVENT_BUS, utils_1.ContainerRegistrationKeys.LOGGER],
        defaultModuleDeclaration: {
            scope: types_1.MODULE_SCOPE.INTERNAL,
        },
    },
    [utils_1.Modules.PROMOTION]: {
        key: utils_1.Modules.PROMOTION,
        defaultPackage: false,
        label: (0, utils_1.upperCaseFirst)(utils_1.Modules.PROMOTION),
        isRequired: false,
        isQueryable: true,
        dependencies: [utils_1.ContainerRegistrationKeys.LOGGER],
        defaultModuleDeclaration: {
            scope: types_1.MODULE_SCOPE.INTERNAL,
        },
    },
    [utils_1.Modules.AUTH]: {
        key: utils_1.Modules.AUTH,
        defaultPackage: false,
        label: (0, utils_1.upperCaseFirst)(utils_1.Modules.AUTH),
        isRequired: false,
        isQueryable: true,
        dependencies: [utils_1.ContainerRegistrationKeys.LOGGER, utils_1.Modules.CACHE],
        defaultModuleDeclaration: {
            scope: types_1.MODULE_SCOPE.INTERNAL,
        },
    },
    [utils_1.Modules.WORKFLOW_ENGINE]: {
        key: utils_1.Modules.WORKFLOW_ENGINE,
        defaultPackage: false,
        label: (0, utils_1.upperCaseFirst)(utils_1.Modules.WORKFLOW_ENGINE),
        isRequired: false,
        isQueryable: true,
        dependencies: [utils_1.ContainerRegistrationKeys.LOGGER],
        __passSharedContainer: true,
        defaultModuleDeclaration: {
            scope: types_1.MODULE_SCOPE.INTERNAL,
        },
    },
    [utils_1.Modules.SALES_CHANNEL]: {
        key: utils_1.Modules.SALES_CHANNEL,
        defaultPackage: false,
        label: (0, utils_1.upperCaseFirst)(utils_1.Modules.SALES_CHANNEL),
        isRequired: false,
        isQueryable: true,
        dependencies: [utils_1.ContainerRegistrationKeys.LOGGER],
        defaultModuleDeclaration: {
            scope: types_1.MODULE_SCOPE.INTERNAL,
        },
    },
    [utils_1.Modules.FULFILLMENT]: {
        key: utils_1.Modules.FULFILLMENT,
        defaultPackage: false,
        label: (0, utils_1.upperCaseFirst)(utils_1.Modules.FULFILLMENT),
        isRequired: false,
        isQueryable: true,
        dependencies: [utils_1.ContainerRegistrationKeys.LOGGER, utils_1.Modules.EVENT_BUS],
        defaultModuleDeclaration: {
            scope: types_1.MODULE_SCOPE.INTERNAL,
        },
    },
    [utils_1.Modules.CART]: {
        key: utils_1.Modules.CART,
        defaultPackage: false,
        label: (0, utils_1.upperCaseFirst)(utils_1.Modules.CART),
        isRequired: false,
        isQueryable: true,
        dependencies: [utils_1.ContainerRegistrationKeys.LOGGER],
        defaultModuleDeclaration: {
            scope: types_1.MODULE_SCOPE.INTERNAL,
        },
    },
    [utils_1.Modules.CUSTOMER]: {
        key: utils_1.Modules.CUSTOMER,
        defaultPackage: false,
        label: (0, utils_1.upperCaseFirst)(utils_1.Modules.CUSTOMER),
        isRequired: false,
        isQueryable: true,
        dependencies: [utils_1.ContainerRegistrationKeys.LOGGER],
        defaultModuleDeclaration: {
            scope: types_1.MODULE_SCOPE.INTERNAL,
        },
    },
    [utils_1.Modules.PAYMENT]: {
        key: utils_1.Modules.PAYMENT,
        defaultPackage: false,
        label: (0, utils_1.upperCaseFirst)(utils_1.Modules.PAYMENT),
        isRequired: false,
        isQueryable: true,
        dependencies: [utils_1.ContainerRegistrationKeys.LOGGER],
        defaultModuleDeclaration: {
            scope: types_1.MODULE_SCOPE.INTERNAL,
        },
    },
    [utils_1.Modules.USER]: {
        key: utils_1.Modules.USER,
        defaultPackage: false,
        label: (0, utils_1.upperCaseFirst)(utils_1.Modules.USER),
        isRequired: false,
        isQueryable: true,
        dependencies: [utils_1.Modules.EVENT_BUS, utils_1.ContainerRegistrationKeys.LOGGER],
        defaultModuleDeclaration: {
            scope: types_1.MODULE_SCOPE.INTERNAL,
        },
    },
    [utils_1.Modules.REGION]: {
        key: utils_1.Modules.REGION,
        defaultPackage: false,
        label: (0, utils_1.upperCaseFirst)(utils_1.Modules.REGION),
        isRequired: false,
        isQueryable: true,
        dependencies: [utils_1.ContainerRegistrationKeys.LOGGER],
        defaultModuleDeclaration: {
            scope: types_1.MODULE_SCOPE.INTERNAL,
        },
    },
    [utils_1.Modules.ORDER]: {
        key: utils_1.Modules.ORDER,
        defaultPackage: false,
        label: (0, utils_1.upperCaseFirst)(utils_1.Modules.ORDER),
        isRequired: false,
        isQueryable: true,
        dependencies: [utils_1.ContainerRegistrationKeys.LOGGER, utils_1.Modules.EVENT_BUS],
        defaultModuleDeclaration: {
            scope: types_1.MODULE_SCOPE.INTERNAL,
        },
    },
    [utils_1.Modules.TAX]: {
        key: utils_1.Modules.TAX,
        defaultPackage: false,
        label: (0, utils_1.upperCaseFirst)(utils_1.Modules.TAX),
        isRequired: false,
        isQueryable: true,
        dependencies: [utils_1.ContainerRegistrationKeys.LOGGER, utils_1.Modules.EVENT_BUS],
        defaultModuleDeclaration: {
            scope: types_1.MODULE_SCOPE.INTERNAL,
        },
    },
    [utils_1.Modules.API_KEY]: {
        key: utils_1.Modules.API_KEY,
        defaultPackage: false,
        label: (0, utils_1.upperCaseFirst)(utils_1.Modules.API_KEY),
        isRequired: false,
        isQueryable: true,
        dependencies: [utils_1.ContainerRegistrationKeys.LOGGER],
        defaultModuleDeclaration: {
            scope: types_1.MODULE_SCOPE.INTERNAL,
        },
    },
    [utils_1.Modules.STORE]: {
        key: utils_1.Modules.STORE,
        defaultPackage: false,
        label: (0, utils_1.upperCaseFirst)(utils_1.Modules.STORE),
        isRequired: false,
        isQueryable: true,
        dependencies: [utils_1.ContainerRegistrationKeys.LOGGER],
        defaultModuleDeclaration: {
            scope: types_1.MODULE_SCOPE.INTERNAL,
        },
    },
    [utils_1.Modules.CURRENCY]: {
        key: utils_1.Modules.CURRENCY,
        defaultPackage: false,
        label: (0, utils_1.upperCaseFirst)(utils_1.Modules.CURRENCY),
        isRequired: false,
        isQueryable: true,
        dependencies: [utils_1.ContainerRegistrationKeys.LOGGER],
        defaultModuleDeclaration: {
            scope: types_1.MODULE_SCOPE.INTERNAL,
        },
    },
    [utils_1.Modules.FILE]: {
        key: utils_1.Modules.FILE,
        defaultPackage: false,
        label: (0, utils_1.upperCaseFirst)(utils_1.Modules.FILE),
        isRequired: false,
        isQueryable: true,
        dependencies: [utils_1.ContainerRegistrationKeys.LOGGER],
        defaultModuleDeclaration: {
            scope: types_1.MODULE_SCOPE.INTERNAL,
        },
    },
    [utils_1.Modules.NOTIFICATION]: {
        key: utils_1.Modules.NOTIFICATION,
        defaultPackage: false,
        label: (0, utils_1.upperCaseFirst)(utils_1.Modules.NOTIFICATION),
        isRequired: false,
        isQueryable: true,
        dependencies: [utils_1.Modules.EVENT_BUS, utils_1.ContainerRegistrationKeys.LOGGER],
        defaultModuleDeclaration: {
            scope: types_1.MODULE_SCOPE.INTERNAL,
        },
    },
    [utils_1.Modules.INDEX]: {
        key: utils_1.Modules.INDEX,
        defaultPackage: false,
        label: (0, utils_1.upperCaseFirst)(utils_1.Modules.INDEX),
        isRequired: false,
        isQueryable: false,
        dependencies: [
            utils_1.Modules.EVENT_BUS,
            utils_1.Modules.LOCKING,
            utils_1.ContainerRegistrationKeys.LOGGER,
            utils_1.ContainerRegistrationKeys.REMOTE_QUERY,
            utils_1.ContainerRegistrationKeys.QUERY,
        ],
        defaultModuleDeclaration: {
            scope: types_1.MODULE_SCOPE.INTERNAL,
        },
    },
    [utils_1.Modules.LOCKING]: {
        key: utils_1.Modules.LOCKING,
        defaultPackage: false,
        label: (0, utils_1.upperCaseFirst)(utils_1.Modules.LOCKING),
        isRequired: false,
        isQueryable: false,
        dependencies: [utils_1.ContainerRegistrationKeys.LOGGER],
        defaultModuleDeclaration: {
            scope: types_1.MODULE_SCOPE.INTERNAL,
        },
    },
};
exports.MODULE_DEFINITIONS = Object.values(exports.ModulesDefinition);
exports.default = exports.MODULE_DEFINITIONS;
//# sourceMappingURL=definitions.js.map