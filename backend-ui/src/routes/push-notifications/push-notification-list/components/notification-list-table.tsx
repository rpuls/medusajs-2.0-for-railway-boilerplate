import { useQuery } from "@tanstack/react-query"
import { keepPreviousData } from "@tanstack/react-query"
import { createColumnHelper } from "@tanstack/react-table"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Button, Container, Heading, Text } from "@medusajs/ui"
import { DataTable, useDataTable } from "@medusajs/ui"
import { sdk } from "../../../../lib/client"
import { Link } from "react-router-dom"

const PAGE_SIZE = 20

interface Notification {
  id: string
  title: string
  body: string
  status: "pending" | "sent" | "failed" | "cancelled"
  target_type: "user" | "broadcast"
  scheduled_at: string | null
  sent_at: string | null
  created_at: string
}

const columnHelper = createColumnHelper<Notification>()

export const NotificationListTable = () => {
  const { t } = useTranslation()
  const [offset, setOffset] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ["push-notifications", offset],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"}/admin/push-notifications?limit=${PAGE_SIZE}&offset=${offset}`,
        {
          credentials: "include",
        }
      )
      if (!response.ok) {
        throw new Error("Failed to fetch notifications")
      }
      return response.json()
    },
    placeholderData: keepPreviousData,
  })

  const notifications = data?.notifications || []
  const count = data?.count || 0

  const columns = [
    columnHelper.accessor("title", {
      header: "Title",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("body", {
      header: "Body",
      cell: (info) => {
        const body = info.getValue()
        return body.length > 50 ? `${body.substring(0, 50)}...` : body
      },
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => {
        const status = info.getValue()
        const colors = {
          pending: "bg-yellow-100 text-yellow-800",
          sent: "bg-green-100 text-green-800",
          failed: "bg-red-100 text-red-800",
          cancelled: "bg-gray-100 text-gray-800",
        }
        return (
          <span className={`px-2 py-1 rounded text-xs ${colors[status] || ""}`}>
            {status}
          </span>
        )
      },
    }),
    columnHelper.accessor("target_type", {
      header: "Target",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("scheduled_at", {
      header: "Scheduled",
      cell: (info) => {
        const scheduled = info.getValue()
        return scheduled ? new Date(scheduled).toLocaleString() : "Immediate"
      },
    }),
    columnHelper.accessor("created_at", {
      header: "Created",
      cell: (info) => new Date(info.getValue()).toLocaleString(),
    }),
  ]

  const { table } = useDataTable({
    data: notifications,
    columns,
    count,
    enablePagination: true,
    getRowId: (row) => row.id,
    pageSize: PAGE_SIZE,
    pageIndex: Math.floor(offset / PAGE_SIZE),
    onPaginationChange: (updater) => {
      const newState =
        typeof updater === "function"
          ? updater({ pageIndex: Math.floor(offset / PAGE_SIZE), pageSize: PAGE_SIZE })
          : updater
      setOffset(newState.pageIndex * PAGE_SIZE)
    },
  })

  return (
    <div className="p-6">
      <div className="mb-4 flex justify-between items-center">
        <Heading level="h2">Notifications</Heading>
        <Link to="/push-notifications/create">
          <Button>Create Notification</Button>
        </Link>
      </div>
      <DataTable
        table={table}
        columns={columns}
        count={count}
        pageSize={PAGE_SIZE}
        isLoading={isLoading}
        pagination
      />
    </div>
  )
}

