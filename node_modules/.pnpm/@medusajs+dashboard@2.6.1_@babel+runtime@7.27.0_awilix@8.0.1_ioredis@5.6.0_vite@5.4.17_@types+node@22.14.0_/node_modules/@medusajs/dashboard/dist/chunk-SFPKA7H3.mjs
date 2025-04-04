import {
  queryKeysFactory
} from "./chunk-774WSTCC.mjs";
import {
  sdk
} from "./chunk-WAYDNCEG.mjs";

// src/hooks/api/workflow-executions.tsx
import { useQuery } from "@tanstack/react-query";
var WORKFLOW_EXECUTIONS_QUERY_KEY = "workflow_executions";
var workflowExecutionsQueryKeys = queryKeysFactory(
  WORKFLOW_EXECUTIONS_QUERY_KEY
);
var useWorkflowExecutions = (query, options) => {
  const { data, ...rest } = useQuery({
    queryFn: () => sdk.admin.workflowExecution.list(query),
    queryKey: workflowExecutionsQueryKeys.list(query),
    ...options
  });
  return { ...data, ...rest };
};
var useWorkflowExecution = (id, options) => {
  const { data, ...rest } = useQuery({
    queryFn: () => sdk.admin.workflowExecution.retrieve(id),
    queryKey: workflowExecutionsQueryKeys.detail(id),
    ...options
  });
  return { ...data, ...rest };
};

export {
  workflowExecutionsQueryKeys,
  useWorkflowExecutions,
  useWorkflowExecution
};
