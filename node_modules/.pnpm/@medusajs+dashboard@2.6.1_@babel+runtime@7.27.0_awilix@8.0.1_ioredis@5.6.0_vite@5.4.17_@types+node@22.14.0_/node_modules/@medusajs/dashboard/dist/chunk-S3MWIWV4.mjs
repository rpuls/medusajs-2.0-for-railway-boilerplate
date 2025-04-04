import {
  queryClient
} from "./chunk-FXYH54JP.mjs";
import {
  queryKeysFactory
} from "./chunk-774WSTCC.mjs";
import {
  sdk
} from "./chunk-WAYDNCEG.mjs";

// src/hooks/api/customers.tsx
import {
  useMutation as useMutation2,
  useQuery as useQuery2
} from "@tanstack/react-query";

// src/hooks/api/customer-groups.tsx
import {
  useMutation,
  useQuery
} from "@tanstack/react-query";
var CUSTOMER_GROUPS_QUERY_KEY = "customer_groups";
var customerGroupsQueryKeys = queryKeysFactory(
  CUSTOMER_GROUPS_QUERY_KEY
);
var useCustomerGroup = (id, query, options) => {
  const { data, ...rest } = useQuery({
    queryKey: customerGroupsQueryKeys.detail(id, query),
    queryFn: async () => sdk.admin.customerGroup.retrieve(id, query),
    ...options
  });
  return { ...data, ...rest };
};
var useCustomerGroups = (query, options) => {
  const { data, ...rest } = useQuery({
    queryFn: () => sdk.admin.customerGroup.list(query),
    queryKey: customerGroupsQueryKeys.list(query),
    ...options
  });
  return { ...data, ...rest };
};
var useCreateCustomerGroup = (options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.customerGroup.create(payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: customerGroupsQueryKeys.lists()
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useUpdateCustomerGroup = (id, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.customerGroup.update(id, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: customerGroupsQueryKeys.lists()
      });
      queryClient.invalidateQueries({
        queryKey: customerGroupsQueryKeys.detail(id)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useDeleteCustomerGroup = (id, options) => {
  return useMutation({
    mutationFn: () => sdk.admin.customerGroup.delete(id),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: customerGroupsQueryKeys.lists()
      });
      queryClient.invalidateQueries({
        queryKey: customerGroupsQueryKeys.detail(id)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useDeleteCustomerGroupLazy = (options) => {
  return useMutation({
    mutationFn: ({ id }) => sdk.admin.customerGroup.delete(id),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: customerGroupsQueryKeys.lists()
      });
      queryClient.invalidateQueries({
        queryKey: customerGroupsQueryKeys.detail(variables.id)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useAddCustomersToGroup = (id, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.customerGroup.batchCustomers(id, { add: payload }),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: customerGroupsQueryKeys.lists()
      });
      queryClient.invalidateQueries({
        queryKey: customerGroupsQueryKeys.detail(id)
      });
      queryClient.invalidateQueries({
        queryKey: customersQueryKeys.lists()
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useRemoveCustomersFromGroup = (id, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.customerGroup.batchCustomers(id, { remove: payload }),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: customerGroupsQueryKeys.lists()
      });
      queryClient.invalidateQueries({
        queryKey: customerGroupsQueryKeys.detail(id)
      });
      queryClient.invalidateQueries({
        queryKey: customersQueryKeys.lists()
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

// src/hooks/api/customers.tsx
var CUSTOMERS_QUERY_KEY = "customers";
var customersQueryKeys = queryKeysFactory(CUSTOMERS_QUERY_KEY);
var useCustomer = (id, query, options) => {
  const { data, ...rest } = useQuery2({
    queryKey: customersQueryKeys.detail(id),
    queryFn: async () => sdk.admin.customer.retrieve(id, query),
    ...options
  });
  return { ...data, ...rest };
};
var useCustomers = (query, options) => {
  const { data, ...rest } = useQuery2({
    queryFn: () => sdk.admin.customer.list(query),
    queryKey: customersQueryKeys.list(query),
    ...options
  });
  return { ...data, ...rest };
};
var useCreateCustomer = (options) => {
  return useMutation2({
    mutationFn: (payload) => sdk.admin.customer.create(payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: customersQueryKeys.lists() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useUpdateCustomer = (id, options) => {
  return useMutation2({
    mutationFn: (payload) => sdk.admin.customer.update(id, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: customersQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: customersQueryKeys.detail(id) });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useDeleteCustomer = (id, options) => {
  return useMutation2({
    mutationFn: () => sdk.admin.customer.delete(id),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: customersQueryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: customersQueryKeys.detail(id)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useBatchCustomerCustomerGroups = (id, options) => {
  return useMutation2({
    mutationFn: (payload) => sdk.admin.customer.batchCustomerGroups(id, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: customerGroupsQueryKeys.details()
      });
      queryClient.invalidateQueries({
        queryKey: customerGroupsQueryKeys.lists()
      });
      queryClient.invalidateQueries({
        queryKey: customersQueryKeys.lists()
      });
      queryClient.invalidateQueries({
        queryKey: customersQueryKeys.details()
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

export {
  useCustomer,
  useCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
  useBatchCustomerCustomerGroups,
  customerGroupsQueryKeys,
  useCustomerGroup,
  useCustomerGroups,
  useCreateCustomerGroup,
  useUpdateCustomerGroup,
  useDeleteCustomerGroup,
  useDeleteCustomerGroupLazy,
  useAddCustomersToGroup,
  useRemoveCustomersFromGroup
};
