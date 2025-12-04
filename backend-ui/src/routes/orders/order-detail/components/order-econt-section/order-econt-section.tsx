import { HttpTypes } from "@medusajs/types"
import {
  Container,
  Heading,
  Text,
  Button,
  toast,
  usePrompt,
} from "@medusajs/ui"
import { useState } from "react"
import { useTranslation } from "react-i18next"

type OrderEcontSectionProps = {
  order: HttpTypes.AdminOrder
}

export const OrderEcontSection = ({ order }: OrderEcontSectionProps) => {
  const { t } = useTranslation()
  const prompt = usePrompt()
  const [isCreating, setIsCreating] = useState(false)
  const [isLoadingStatus, setIsLoadingStatus] = useState(false)

  const econtData = order.metadata?.econt as any
  const hasEcontData = !!econtData

  const handleCreateShipment = async () => {
    const res = await prompt({
      title: "Create Econt Shipment",
      description: "Are you sure you want to create a shipment for this order?",
      confirmText: "Create",
      cancelText: "Cancel",
    })

    if (!res) {
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch(
        `/admin/orders/${order.id}/econt/create-shipment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            // Add shipment data here based on order and Econt data
            // This is a simplified version - you'll need to build the full structure
          }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create shipment")
      }

      const result = await response.json()
      toast.success("Shipment created successfully")
      
      // Refresh the page to show updated data
      window.location.reload()
    } catch (error: any) {
      toast.error(error.message || "Failed to create shipment")
    } finally {
      setIsCreating(false)
    }
  }

  const handleGetStatus = async () => {
    setIsLoadingStatus(true)
    try {
      const response = await fetch(
        `/admin/orders/${order.id}/econt/shipment-status`
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to get shipment status")
      }

      const result = await response.json()
      toast.success("Shipment status updated")
      
      // Refresh the page to show updated data
      window.location.reload()
    } catch (error: any) {
      toast.error(error.message || "Failed to get shipment status")
    } finally {
      setIsLoadingStatus(false)
    }
  }

  const handleDeleteShipment = async () => {
    const res = await prompt({
      title: "Delete Econt Shipment",
      description:
        "Are you sure you want to delete this shipment? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
    })

    if (!res) {
      return
    }

    try {
      const response = await fetch(`/admin/orders/${order.id}/econt/shipment`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to delete shipment")
      }

      toast.success("Shipment deleted successfully")
      
      // Refresh the page to show updated data
      window.location.reload()
    } catch (error: any) {
      toast.error(error.message || "Failed to delete shipment")
    }
  }

  if (!hasEcontData) {
    return null
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Econt Shipping</Heading>
      </div>

      <div className="px-6 py-4 space-y-4">
        {/* Display Econt shipping data */}
        <div className="space-y-2">
          <Text className="text-sm font-medium">Shipping Type:</Text>
          <Text className="text-sm">
            {econtData.shipping_to === "OFFICE" ? "To Office" : "To Address"}
          </Text>
        </div>

        {econtData.city_name && (
          <div className="space-y-2">
            <Text className="text-sm font-medium">City:</Text>
            <Text className="text-sm">
              {econtData.city_name} ({econtData.postcode})
            </Text>
          </div>
        )}

        {econtData.shipping_to === "OFFICE" && econtData.office_code && (
          <div className="space-y-2">
            <Text className="text-sm font-medium">Office Code:</Text>
            <Text className="text-sm">{econtData.office_code}</Text>
          </div>
        )}

        {econtData.shipping_to === "DOOR" && (
          <div className="space-y-2">
            {econtData.street && (
              <div>
                <Text className="text-sm font-medium">Street:</Text>
                <Text className="text-sm">{econtData.street}</Text>
              </div>
            )}
            {econtData.street_num && (
              <div>
                <Text className="text-sm font-medium">Street Number:</Text>
                <Text className="text-sm">{econtData.street_num}</Text>
              </div>
            )}
            {econtData.building_num && (
              <div>
                <Text className="text-sm font-medium">Building:</Text>
                <Text className="text-sm">{econtData.building_num}</Text>
              </div>
            )}
            {econtData.apartment_num && (
              <div>
                <Text className="text-sm font-medium">Apartment:</Text>
                <Text className="text-sm">{econtData.apartment_num}</Text>
              </div>
            )}
          </div>
        )}

        {/* Shipment information */}
        {econtData.loading_num && (
          <div className="space-y-2 pt-4 border-t">
            <Text className="text-sm font-medium">Waybill Number:</Text>
            <Text className="text-sm">{econtData.loading_num}</Text>
            {econtData.pdf_url && (
              <div className="mt-2">
                <a
                  href={econtData.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  View PDF Label
                </a>
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 pt-4 border-t">
          {!econtData.loading_num && (
            <Button onClick={handleCreateShipment} isLoading={isCreating}>
              Create Shipment
            </Button>
          )}
          {econtData.loading_num && (
            <>
              <Button
                onClick={handleGetStatus}
                isLoading={isLoadingStatus}
                variant="secondary"
              >
                Refresh Status
              </Button>
              <Button
                onClick={handleDeleteShipment}
                variant="danger"
              >
                Delete Shipment
              </Button>
              {econtData.pdf_url && (
                <Button
                  onClick={() => window.open(econtData.pdf_url, "_blank")}
                  variant="secondary"
                >
                  View PDF
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </Container>
  )
}

