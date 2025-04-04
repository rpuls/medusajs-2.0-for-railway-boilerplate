// src/lib/query-key-factory.ts
var queryKeysFactory = (globalKey) => {
  const queryKeyFactory = {
    all: [globalKey],
    lists: () => [...queryKeyFactory.all, "list"],
    list: (query) => [...queryKeyFactory.lists(), query ? { query } : void 0].filter(
      (k) => !!k
    ),
    details: () => [...queryKeyFactory.all, "detail"],
    detail: (id, query) => [...queryKeyFactory.details(), id, query ? { query } : void 0].filter(
      (k) => !!k
    )
  };
  return queryKeyFactory;
};

export {
  queryKeysFactory
};
