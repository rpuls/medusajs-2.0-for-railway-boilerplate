// src/routes/workflow-executions/constants.ts
var STEP_IN_PROGRESS_STATES = [
  "compensating" /* COMPENSATING */,
  "invoking" /* INVOKING */
];
var STEP_SKIPPED_STATES = [
  "skipped" /* SKIPPED */,
  "skipped_failure" /* SKIPPED_FAILURE */
];
var STEP_OK_STATES = [
  "done" /* DONE */
];
var STEP_ERROR_STATES = [
  "failed" /* FAILED */,
  "reverted" /* REVERTED */,
  "timeout" /* TIMEOUT */,
  "dormant" /* DORMANT */
];
var STEP_INACTIVE_STATES = [
  "not_started" /* NOT_STARTED */
];
var TRANSACTION_OK_STATES = [
  "done" /* DONE */
];
var TRANSACTION_ERROR_STATES = [
  "failed" /* FAILED */,
  "reverted" /* REVERTED */
];
var TRANSACTION_IN_PROGRESS_STATES = [
  "invoking" /* INVOKING */,
  "waiting_to_compensate" /* WAITING_TO_COMPENSATE */,
  "compensating" /* COMPENSATING */
];

// src/routes/workflow-executions/utils.ts
var getTransactionStateColor = (state) => {
  let statusColor = "green";
  if (TRANSACTION_ERROR_STATES.includes(state)) {
    statusColor = "red";
  }
  if (TRANSACTION_IN_PROGRESS_STATES.includes(state)) {
    statusColor = "orange";
  }
  return statusColor;
};
var getTransactionState = (t, state) => {
  switch (state) {
    case "done" /* DONE */:
      return t("workflowExecutions.state.done");
    case "failed" /* FAILED */:
      return t("workflowExecutions.state.failed");
    case "reverted" /* REVERTED */:
      return t("workflowExecutions.state.reverted");
    case "invoking" /* INVOKING */:
      return t("workflowExecutions.state.invoking");
    case "waiting_to_compensate" /* WAITING_TO_COMPENSATE */:
      return t("workflowExecutions.transaction.state.waitingToCompensate");
    case "compensating" /* COMPENSATING */:
      return t("workflowExecutions.state.compensating");
    case "not_started" /* NOT_STARTED */:
      return t("workflowExecutions.state.notStarted");
  }
};

export {
  STEP_IN_PROGRESS_STATES,
  STEP_SKIPPED_STATES,
  STEP_OK_STATES,
  STEP_ERROR_STATES,
  STEP_INACTIVE_STATES,
  getTransactionStateColor,
  getTransactionState
};
