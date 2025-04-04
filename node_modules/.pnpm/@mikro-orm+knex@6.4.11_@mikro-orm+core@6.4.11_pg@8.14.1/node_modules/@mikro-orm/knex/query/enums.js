"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JoinType = exports.QueryType = void 0;
var QueryType;
(function (QueryType) {
    QueryType["TRUNCATE"] = "TRUNCATE";
    QueryType["SELECT"] = "SELECT";
    QueryType["COUNT"] = "COUNT";
    QueryType["INSERT"] = "INSERT";
    QueryType["UPDATE"] = "UPDATE";
    QueryType["DELETE"] = "DELETE";
    QueryType["UPSERT"] = "UPSERT";
})(QueryType || (exports.QueryType = QueryType = {}));
var JoinType;
(function (JoinType) {
    JoinType["leftJoin"] = "left join";
    JoinType["innerJoin"] = "inner join";
    JoinType["nestedLeftJoin"] = "nested left join";
    JoinType["nestedInnerJoin"] = "nested inner join";
    JoinType["pivotJoin"] = "pivot join";
    JoinType["innerJoinLateral"] = "inner join lateral";
    JoinType["leftJoinLateral"] = "left join lateral";
})(JoinType || (exports.JoinType = JoinType = {}));
