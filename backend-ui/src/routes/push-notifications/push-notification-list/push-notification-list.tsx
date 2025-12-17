import { Container, Heading, Text } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import { NotificationListTable } from "./components/notification-list-table"

export default function PushNotificationList() {
  const { t } = useTranslation()

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading>Push Notifications</Heading>
          <Text className="text-ui-fg-subtle" size="small">
            Manage and schedule push notifications for your customers
          </Text>
        </div>
      </div>
      <NotificationListTable />
    </Container>
  )
}

