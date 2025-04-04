const createDataTableFilterHelper = () => ({
    accessor: (accessor, props) => ({
        id: accessor,
        ...props,
    }),
    custom: (props) => props,
});
export { createDataTableFilterHelper };
//# sourceMappingURL=create-data-table-filter-helper.js.map