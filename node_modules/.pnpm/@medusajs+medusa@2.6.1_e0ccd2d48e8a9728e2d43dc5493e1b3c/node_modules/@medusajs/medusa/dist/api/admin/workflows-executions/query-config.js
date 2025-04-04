"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTransformQueryConfig = exports.retrieveTransformQueryConfig = exports.defaultAdminWorkflowExecutionsFields = exports.defaultAdminWorkflowExecutionDetailFields = void 0;
exports.defaultAdminWorkflowExecutionDetailFields = [
    "id",
    "workflow_id",
    "transaction_id",
    "context",
    "execution",
    "state",
    "created_at",
    "updated_at",
    "deleted_at",
];
exports.defaultAdminWorkflowExecutionsFields = [
    "id",
    "workflow_id",
    "transaction_id",
    "state",
    "created_at",
    "updated_at",
    "deleted_at",
];
exports.retrieveTransformQueryConfig = {
    defaults: exports.defaultAdminWorkflowExecutionDetailFields,
    isList: false,
};
exports.listTransformQueryConfig = {
    ...exports.retrieveTransformQueryConfig,
    defaults: exports.defaultAdminWorkflowExecutionsFields,
    isList: true,
};
//# sourceMappingURL=query-config.js.map