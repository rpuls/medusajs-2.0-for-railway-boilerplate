import { defineRouteConfig } from "@medusajs/admin-sdk";
import { StatusBadge, Heading } from "@medusajs/ui";
import { useEffect, useMemo, useState } from "react";
import { Table } from "../../components/table";
import { Container } from "../../components/container";
import { Users, Snooze, UserGroup } from "@medusajs/icons";
import { useFetch, VoidQuery } from "../../../utils/queries";
import { storeImpersonation } from "../../../utils/impersonate";

type MerchantsItem = {
  id: string;
  store_name: string;
  user_email: number;
  status: "active" | "inactive";
  can_impersonate: boolean;
};

type MerchantsResponse = {
  merchants: MerchantsItem[];
};

type ImpersonateQuery = {
  userId?: string;
};

type ImpersonateUserResponse = {
  email: string;
  id: string;
};

type ImpersonateResponse = {
  impersionated_as: ImpersonateUserResponse;
};

const MerchantPage = () => {
  const [currentPage, setCurrentPage] = useState(0);

  const { data: merchantsResponse } = useFetch<VoidQuery, MerchantsResponse>(
    `/admin/merchants`,
    [],
    {}
  );

  const { data: impersonateResponse, refetch: impersonate } = useFetch<
    ImpersonateQuery,
    ImpersonateResponse
  >(`/admin/impersonate`, [], {}, { runOnMount: false });

  const columns = [
    {
      key: "store_name",
      label: "Store name",
    },
    {
      key: "user_email",
      label: "Email",
    },
    {
      key: "status",
      label: "Status",
      render: (value: unknown) => {
        const isEnabled = value === "active";

        return (
          <StatusBadge color={isEnabled ? "green" : "grey"}>
            {isEnabled ? "Active" : "Inactive"}
          </StatusBadge>
        );
      },
    },
  ];

  useEffect(() => {
    if (impersonateResponse?.impersionated_as) {
      storeImpersonation(impersonateResponse?.impersionated_as.email);
      window.location.href = "/app";
    }
  }, [impersonateResponse]);

  const actions = useMemo(() => {
    if (!merchantsResponse?.merchants) {
      return [];
    }
    return merchantsResponse?.merchants.map((merchant) => {
      const items = [
        {
          icon: <Snooze />,
          label: "Deactivate",
          onClick: () => {
            alert("Coming soon");
          },
        },
      ];

      if (merchant.can_impersonate) {
        items.push({
          icon: <Users />,
          label: "Impersonate",
          onClick: () => {
            impersonate({ userId: merchant.id });
          },
        });
      }
      return items;
    });
  }, [merchantsResponse?.merchants]);

  return (
    <Container>
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Merchants</Heading>
      </div>
      <Table
        columns={columns}
        data={merchantsResponse?.merchants || []}
        pageSize={2}
        count={2}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        actions={actions}
      />
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Merchants",
  icon: UserGroup,
});

export default MerchantPage;
