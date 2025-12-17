import { useForm } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { Button, Container, Heading, Input, Textarea, Select } from "@medusajs/ui"
import { useTranslation } from "react-i18next"

interface NotificationFormData {
  title: string
  body: string
  icon?: string
  badge?: string
  image?: string
  scheduled_at?: string
  target_type: "user" | "broadcast"
  target_user_ids?: string[]
}

export default function PushNotificationCreate() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { register, handleSubmit, watch, formState: { errors } } = useForm<NotificationFormData>({
    defaultValues: {
      target_type: "broadcast",
    },
  })

  const targetType = watch("target_type")

  const mutation = useMutation({
    mutationFn: async (data: NotificationFormData) => {
      const response = await fetch(
        `${process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"}/admin/push-notifications`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(data),
        }
      )
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to create notification")
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["push-notifications"] })
      navigate("/push-notifications")
    },
  })

  const onSubmit = (data: NotificationFormData) => {
    mutation.mutate(data)
  }

  return (
    <Container className="p-6">
      <Heading className="mb-4">Create Push Notification</Heading>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <Input
            {...register("title", { required: "Title is required" })}
            placeholder="Notification title"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Body *</label>
          <Textarea
            {...register("body", { required: "Body is required" })}
            placeholder="Notification message"
            rows={4}
          />
          {errors.body && (
            <p className="text-red-500 text-sm mt-1">{errors.body.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Target Type *</label>
          <Select {...register("target_type", { required: true })}>
            <option value="broadcast">Broadcast (All Users)</option>
            <option value="user">User-Specific</option>
          </Select>
        </div>

        {targetType === "user" && (
          <div>
            <label className="block text-sm font-medium mb-1">
              User IDs (comma-separated)
            </label>
            <Input
              {...register("target_user_ids")}
              placeholder="user_123, user_456"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Schedule (optional)</label>
          <Input
            type="datetime-local"
            {...register("scheduled_at")}
          />
          <p className="text-sm text-gray-500 mt-1">
            Leave empty to send immediately
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Icon URL (optional)</label>
          <Input {...register("icon")} placeholder="https://example.com/icon.png" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Image URL (optional)</label>
          <Input {...register("image")} placeholder="https://example.com/image.png" />
        </div>

        <div className="flex gap-2">
          <Button type="submit" isLoading={mutation.isPending}>
            Create Notification
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/push-notifications")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Container>
  )
}

