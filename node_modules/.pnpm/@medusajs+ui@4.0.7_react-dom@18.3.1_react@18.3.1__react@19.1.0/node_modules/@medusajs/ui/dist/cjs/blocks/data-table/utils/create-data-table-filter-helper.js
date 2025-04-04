"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDataTableFilterHelper = void 0;
const createDataTableFilterHelper = () => ({
    accessor: (accessor, props) => ({
        id: accessor,
        ...props,
    }),
    custom: (props) => props,
});
exports.createDataTableFilterHelper = createDataTableFilterHelper;
//# sourceMappingURL=create-data-table-filter-helper.js.map