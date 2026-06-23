"use client"

import { resetOnboardingState } from "@lib/data/onboarding"
import { Button, Container, Text } from "@medusajs/ui"

const OnboardingCta = ({ orderId }: { orderId: string }) => {
  return (
    <Container className="max-w-4xl h-full bg-ui-bg-subtle w-full">
      <div className="flex flex-col gap-y-4 center p-4 md:items-center">
        <Text className="text-ui-fg-base text-xl">
          Đơn hàng thử nghiệm của bạn đã được tạo thành công! 🎉
        </Text>
        <Text className="text-ui-fg-subtle text-small-regular">
          Bây giờ bạn có thể hoàn tất thiết lập cửa hàng trong trang quản trị.
        </Text>
        <Button
          className="w-fit"
          size="xlarge"
          onClick={() => resetOnboardingState(orderId)}
        >
          Hoàn tất thiết lập trong trang quản trị
        </Button>
      </div>
    </Container>
  )
}

export default OnboardingCta
