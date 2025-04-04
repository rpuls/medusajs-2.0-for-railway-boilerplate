import {
  DateCell
} from "./chunk-WYX5PIA3.mjs";
import {
  StatusCell
} from "./chunk-ADOCJB6L.mjs";
import {
  PlaceholderCell
} from "./chunk-P3UUX2T6.mjs";

// src/hooks/table/columns/use-customer-table-columns.tsx
import { createColumnHelper } from "@tanstack/react-table";
import { useMemo } from "react";

// src/components/table/table-cells/common/email-cell/email-cell.tsx
import { useTranslation } from "react-i18next";
import { jsx } from "react/jsx-runtime";
var EmailCell = ({ email }) => {
  if (!email) {
    return /* @__PURE__ */ jsx(PlaceholderCell, {});
  }
  return /* @__PURE__ */ jsx("div", { className: "flex h-full w-full items-center overflow-hidden", children: /* @__PURE__ */ jsx("span", { className: "truncate", children: email }) });
};
var EmailHeader = () => {
  const { t } = useTranslation();
  return /* @__PURE__ */ jsx("div", { className: "flex h-full w-full items-center", children: /* @__PURE__ */ jsx("span", { className: "truncate", children: t("fields.email") }) });
};

// src/components/table/table-cells/common/name-cell/name-cell.tsx
import { useTranslation as useTranslation2 } from "react-i18next";
import { jsx as jsx2 } from "react/jsx-runtime";
var NameCell = ({ firstName, lastName }) => {
  if (!firstName && !lastName) {
    return /* @__PURE__ */ jsx2(PlaceholderCell, {});
  }
  const name = [firstName, lastName].filter(Boolean).join(" ");
  return /* @__PURE__ */ jsx2("div", { className: "flex h-full w-full items-center overflow-hidden", children: /* @__PURE__ */ jsx2("span", { className: "truncate", children: name }) });
};
var NameHeader = () => {
  const { t } = useTranslation2();
  return /* @__PURE__ */ jsx2("div", { className: "flex h-full w-full items-center", children: /* @__PURE__ */ jsx2("span", { className: "truncate", children: t("fields.name") }) });
};

// src/components/table/table-cells/customer/account-cell/account-cell.tsx
import { useTranslation as useTranslation3 } from "react-i18next";
import { jsx as jsx3 } from "react/jsx-runtime";
var AccountCell = ({ hasAccount }) => {
  const { t } = useTranslation3();
  const color = hasAccount ? "green" : "orange";
  const text = hasAccount ? t("customers.fields.registered") : t("customers.fields.guest");
  return /* @__PURE__ */ jsx3(StatusCell, { color, children: text });
};
var AccountHeader = () => {
  const { t } = useTranslation3();
  return /* @__PURE__ */ jsx3("div", { className: "flex h-full w-full items-center", children: /* @__PURE__ */ jsx3("span", { className: "truncate", children: t("fields.account") }) });
};

// src/components/table/table-cells/customer/first-seen-cell/first-seen-cell.tsx
import { useTranslation as useTranslation4 } from "react-i18next";
import { jsx as jsx4 } from "react/jsx-runtime";
var FirstSeenCell = ({ createdAt }) => {
  if (!createdAt) {
    return /* @__PURE__ */ jsx4(PlaceholderCell, {});
  }
  return /* @__PURE__ */ jsx4(DateCell, { date: createdAt });
};
var FirstSeenHeader = () => {
  const { t } = useTranslation4();
  return /* @__PURE__ */ jsx4("div", { className: "flex h-full w-full items-center", children: /* @__PURE__ */ jsx4("span", { className: "truncate", children: t("fields.createdAt") }) });
};

// src/hooks/table/columns/use-customer-table-columns.tsx
import { jsx as jsx5 } from "react/jsx-runtime";
var columnHelper = createColumnHelper();
var useCustomerTableColumns = () => {
  return useMemo(
    () => [
      columnHelper.accessor("email", {
        header: () => /* @__PURE__ */ jsx5(EmailHeader, {}),
        cell: ({ getValue }) => /* @__PURE__ */ jsx5(EmailCell, { email: getValue() })
      }),
      columnHelper.display({
        id: "name",
        header: () => /* @__PURE__ */ jsx5(NameHeader, {}),
        cell: ({
          row: {
            original: { first_name, last_name }
          }
        }) => /* @__PURE__ */ jsx5(NameCell, { firstName: first_name, lastName: last_name })
      }),
      columnHelper.accessor("has_account", {
        header: () => /* @__PURE__ */ jsx5(AccountHeader, {}),
        cell: ({ getValue }) => /* @__PURE__ */ jsx5(AccountCell, { hasAccount: getValue() })
      }),
      columnHelper.accessor("created_at", {
        header: () => /* @__PURE__ */ jsx5(FirstSeenHeader, {}),
        cell: ({ getValue }) => /* @__PURE__ */ jsx5(FirstSeenCell, { createdAt: getValue() })
      })
    ],
    []
  );
};

export {
  useCustomerTableColumns
};
