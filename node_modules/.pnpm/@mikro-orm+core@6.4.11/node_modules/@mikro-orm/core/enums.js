"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeferMode = exports.PlainObject = exports.EventTypeMap = exports.EventType = exports.IsolationLevel = exports.LockMode = exports.DataloaderType = exports.LoadStrategy = exports.Cascade = exports.ReferenceKind = exports.SCALAR_TYPES = exports.QueryFlag = exports.QueryOrderNumeric = exports.QueryOrder = exports.JSON_KEY_OPERATORS = exports.ARRAY_OPERATORS = exports.QueryOperator = exports.GroupOperator = exports.PopulatePath = exports.PopulateHint = exports.FlushMode = void 0;
var FlushMode;
(function (FlushMode) {
    /** The `EntityManager` delays the flush until the current Transaction is committed. */
    FlushMode["COMMIT"] = "commit";
    /** This is the default mode, and it flushes the `EntityManager` only if necessary. */
    FlushMode["AUTO"] = "auto";
    /** Flushes the `EntityManager` before every query. */
    FlushMode["ALWAYS"] = "always";
})(FlushMode || (exports.FlushMode = FlushMode = {}));
var PopulateHint;
(function (PopulateHint) {
    PopulateHint["INFER"] = "infer";
    PopulateHint["ALL"] = "all";
})(PopulateHint || (exports.PopulateHint = PopulateHint = {}));
var PopulatePath;
(function (PopulatePath) {
    PopulatePath["INFER"] = "$infer";
    PopulatePath["ALL"] = "*";
})(PopulatePath || (exports.PopulatePath = PopulatePath = {}));
var GroupOperator;
(function (GroupOperator) {
    GroupOperator["$and"] = "and";
    GroupOperator["$or"] = "or";
})(GroupOperator || (exports.GroupOperator = GroupOperator = {}));
var QueryOperator;
(function (QueryOperator) {
    QueryOperator["$eq"] = "=";
    QueryOperator["$in"] = "in";
    QueryOperator["$nin"] = "not in";
    QueryOperator["$gt"] = ">";
    QueryOperator["$gte"] = ">=";
    QueryOperator["$lt"] = "<";
    QueryOperator["$lte"] = "<=";
    QueryOperator["$ne"] = "!=";
    QueryOperator["$not"] = "not";
    QueryOperator["$like"] = "like";
    QueryOperator["$re"] = "regexp";
    QueryOperator["$fulltext"] = "fulltext";
    QueryOperator["$exists"] = "not null";
    QueryOperator["$ilike"] = "ilike";
    QueryOperator["$overlap"] = "&&";
    QueryOperator["$contains"] = "@>";
    QueryOperator["$contained"] = "<@";
    QueryOperator["$none"] = "none";
    QueryOperator["$some"] = "some";
    QueryOperator["$every"] = "every";
    QueryOperator["$hasKey"] = "?";
    QueryOperator["$hasKeys"] = "?&";
    QueryOperator["$hasSomeKeys"] = "?|";
})(QueryOperator || (exports.QueryOperator = QueryOperator = {}));
exports.ARRAY_OPERATORS = [
    '$eq',
    '$gt',
    '$gte',
    '$lt',
    '$lte',
    '$ne',
    '$overlap',
    '$contains',
    '$contained',
];
exports.JSON_KEY_OPERATORS = [
    '$hasKey',
    '$hasKeys',
    '$hasSomeKeys',
];
var QueryOrder;
(function (QueryOrder) {
    QueryOrder["ASC"] = "ASC";
    QueryOrder["ASC_NULLS_LAST"] = "ASC NULLS LAST";
    QueryOrder["ASC_NULLS_FIRST"] = "ASC NULLS FIRST";
    QueryOrder["DESC"] = "DESC";
    QueryOrder["DESC_NULLS_LAST"] = "DESC NULLS LAST";
    QueryOrder["DESC_NULLS_FIRST"] = "DESC NULLS FIRST";
    QueryOrder["asc"] = "asc";
    QueryOrder["asc_nulls_last"] = "asc nulls last";
    QueryOrder["asc_nulls_first"] = "asc nulls first";
    QueryOrder["desc"] = "desc";
    QueryOrder["desc_nulls_last"] = "desc nulls last";
    QueryOrder["desc_nulls_first"] = "desc nulls first";
})(QueryOrder || (exports.QueryOrder = QueryOrder = {}));
var QueryOrderNumeric;
(function (QueryOrderNumeric) {
    QueryOrderNumeric[QueryOrderNumeric["ASC"] = 1] = "ASC";
    QueryOrderNumeric[QueryOrderNumeric["DESC"] = -1] = "DESC";
})(QueryOrderNumeric || (exports.QueryOrderNumeric = QueryOrderNumeric = {}));
var QueryFlag;
(function (QueryFlag) {
    QueryFlag["DISTINCT"] = "DISTINCT";
    QueryFlag["PAGINATE"] = "PAGINATE";
    QueryFlag["DISABLE_PAGINATE"] = "DISABLE_PAGINATE";
    QueryFlag["UPDATE_SUB_QUERY"] = "UPDATE_SUB_QUERY";
    QueryFlag["DELETE_SUB_QUERY"] = "DELETE_SUB_QUERY";
    QueryFlag["CONVERT_CUSTOM_TYPES"] = "CONVERT_CUSTOM_TYPES";
    QueryFlag["INCLUDE_LAZY_FORMULAS"] = "INCLUDE_LAZY_FORMULAS";
    QueryFlag["AUTO_JOIN_ONE_TO_ONE_OWNER"] = "AUTO_JOIN_ONE_TO_ONE_OWNER";
    QueryFlag["INFER_POPULATE"] = "INFER_POPULATE";
    QueryFlag["IDENTITY_INSERT"] = "IDENTITY_INSERT";
})(QueryFlag || (exports.QueryFlag = QueryFlag = {}));
exports.SCALAR_TYPES = ['string', 'number', 'boolean', 'bigint', 'Date', 'Buffer', 'RegExp'];
var ReferenceKind;
(function (ReferenceKind) {
    ReferenceKind["SCALAR"] = "scalar";
    ReferenceKind["ONE_TO_ONE"] = "1:1";
    ReferenceKind["ONE_TO_MANY"] = "1:m";
    ReferenceKind["MANY_TO_ONE"] = "m:1";
    ReferenceKind["MANY_TO_MANY"] = "m:n";
    ReferenceKind["EMBEDDED"] = "embedded";
})(ReferenceKind || (exports.ReferenceKind = ReferenceKind = {}));
var Cascade;
(function (Cascade) {
    Cascade["PERSIST"] = "persist";
    Cascade["MERGE"] = "merge";
    Cascade["REMOVE"] = "remove";
    Cascade["ALL"] = "all";
    /** @internal */
    Cascade["SCHEDULE_ORPHAN_REMOVAL"] = "schedule_orphan_removal";
    /** @internal */
    Cascade["CANCEL_ORPHAN_REMOVAL"] = "cancel_orphan_removal";
})(Cascade || (exports.Cascade = Cascade = {}));
var LoadStrategy;
(function (LoadStrategy) {
    LoadStrategy["SELECT_IN"] = "select-in";
    LoadStrategy["JOINED"] = "joined";
})(LoadStrategy || (exports.LoadStrategy = LoadStrategy = {}));
var DataloaderType;
(function (DataloaderType) {
    DataloaderType[DataloaderType["NONE"] = 0] = "NONE";
    DataloaderType[DataloaderType["REFERENCE"] = 1] = "REFERENCE";
    DataloaderType[DataloaderType["COLLECTION"] = 2] = "COLLECTION";
    DataloaderType[DataloaderType["ALL"] = 3] = "ALL";
})(DataloaderType || (exports.DataloaderType = DataloaderType = {}));
var LockMode;
(function (LockMode) {
    LockMode[LockMode["NONE"] = 0] = "NONE";
    LockMode[LockMode["OPTIMISTIC"] = 1] = "OPTIMISTIC";
    LockMode[LockMode["PESSIMISTIC_READ"] = 2] = "PESSIMISTIC_READ";
    LockMode[LockMode["PESSIMISTIC_WRITE"] = 3] = "PESSIMISTIC_WRITE";
    LockMode[LockMode["PESSIMISTIC_PARTIAL_WRITE"] = 4] = "PESSIMISTIC_PARTIAL_WRITE";
    LockMode[LockMode["PESSIMISTIC_WRITE_OR_FAIL"] = 5] = "PESSIMISTIC_WRITE_OR_FAIL";
    LockMode[LockMode["PESSIMISTIC_PARTIAL_READ"] = 6] = "PESSIMISTIC_PARTIAL_READ";
    LockMode[LockMode["PESSIMISTIC_READ_OR_FAIL"] = 7] = "PESSIMISTIC_READ_OR_FAIL";
})(LockMode || (exports.LockMode = LockMode = {}));
var IsolationLevel;
(function (IsolationLevel) {
    IsolationLevel["READ_UNCOMMITTED"] = "read uncommitted";
    IsolationLevel["READ_COMMITTED"] = "read committed";
    IsolationLevel["SNAPSHOT"] = "snapshot";
    IsolationLevel["REPEATABLE_READ"] = "repeatable read";
    IsolationLevel["SERIALIZABLE"] = "serializable";
})(IsolationLevel || (exports.IsolationLevel = IsolationLevel = {}));
var EventType;
(function (EventType) {
    EventType["onInit"] = "onInit";
    EventType["onLoad"] = "onLoad";
    EventType["beforeCreate"] = "beforeCreate";
    EventType["afterCreate"] = "afterCreate";
    EventType["beforeUpdate"] = "beforeUpdate";
    EventType["afterUpdate"] = "afterUpdate";
    EventType["beforeUpsert"] = "beforeUpsert";
    EventType["afterUpsert"] = "afterUpsert";
    EventType["beforeDelete"] = "beforeDelete";
    EventType["afterDelete"] = "afterDelete";
    EventType["beforeFlush"] = "beforeFlush";
    EventType["onFlush"] = "onFlush";
    EventType["afterFlush"] = "afterFlush";
    EventType["beforeTransactionStart"] = "beforeTransactionStart";
    EventType["afterTransactionStart"] = "afterTransactionStart";
    EventType["beforeTransactionCommit"] = "beforeTransactionCommit";
    EventType["afterTransactionCommit"] = "afterTransactionCommit";
    EventType["beforeTransactionRollback"] = "beforeTransactionRollback";
    EventType["afterTransactionRollback"] = "afterTransactionRollback";
})(EventType || (exports.EventType = EventType = {}));
exports.EventTypeMap = Object.keys(EventType).reduce((a, b, i) => {
    a[b] = i;
    return a;
}, {});
class PlainObject {
}
exports.PlainObject = PlainObject;
var DeferMode;
(function (DeferMode) {
    DeferMode["INITIALLY_IMMEDIATE"] = "immediate";
    DeferMode["INITIALLY_DEFERRED"] = "deferred";
})(DeferMode || (exports.DeferMode = DeferMode = {}));
