"use client"

import React, { useEffect } from "react"
import { useFormState } from "react-dom"
import Input from "@modules/common/components/input"
import AccountInfo from "@modules/account/components/account-info"
import { HttpTypes } from "@medusajs/types"
import { updateCustomer } from "@lib/data/customer"

type Props = {
  customer: HttpTypes.StoreCustomer
}

const ProfileBodyMeasurements: React.FC<Props> = ({ customer }) => {
  const [successState, setSuccessState] = React.useState(false)

  const meta = (customer.metadata || {}) as Record<string, string>

  const updateMeasurements = async (
    _currentState: Record<string, unknown>,
    formData: FormData
  ) => {
    try {
      await updateCustomer({
        metadata: {
          height:    formData.get("height") as string,
          weight:    formData.get("weight") as string,
          chest:     formData.get("chest") as string,
          waist:     formData.get("waist") as string,
          hip:       formData.get("hip") as string,
          shoulder:  formData.get("shoulder") as string,
        },
      } as any)
      return { success: true, error: null }
    } catch (error: any) {
      return { success: false, error: error.toString() }
    }
  }

  const [state, formAction] = useFormState(updateMeasurements, {
    error: false,
    success: false,
  })

  useEffect(() => {
    setSuccessState(state.success)
  }, [state])

  const hasMeasurements = meta.height || meta.chest

  return (
    <form action={formAction} className="w-full">
      <AccountInfo
        label="Số đo cơ thể"
        currentInfo={
          hasMeasurements
            ? `${meta.height ? meta.height + "cm" : "—"} / ${meta.weight ? meta.weight + "kg" : "—"}`
            : "Chưa có thông tin — thêm để nhận gợi ý size tự động"
        }
        isSuccess={successState}
        isError={!!state.error}
        errorMessage={state.error}
        clearState={() => setSuccessState(false)}
        data-testid="account-measurements-editor"
      >
        <p className="text-sm text-ui-fg-subtle mb-4">
          Thông tin này giúp chúng tôi gợi ý size phù hợp trên mỗi sản phẩm. Chỉ bạn mới thấy số đo này.
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <Input
            label="Chiều cao (cm)"
            name="height"
            type="number"
            min="100"
            max="220"
            defaultValue={meta.height ?? ""}
            data-testid="height-input"
          />
          <Input
            label="Cân nặng (kg)"
            name="weight"
            type="number"
            min="30"
            max="200"
            defaultValue={meta.weight ?? ""}
            data-testid="weight-input"
          />
          <Input
            label="Vòng ngực (cm)"
            name="chest"
            type="number"
            min="50"
            max="150"
            defaultValue={meta.chest ?? ""}
            data-testid="chest-input"
          />
          <Input
            label="Vòng eo (cm)"
            name="waist"
            type="number"
            min="40"
            max="130"
            defaultValue={meta.waist ?? ""}
            data-testid="waist-input"
          />
          <Input
            label="Vòng hông (cm)"
            name="hip"
            type="number"
            min="50"
            max="160"
            defaultValue={meta.hip ?? ""}
            data-testid="hip-input"
          />
          <Input
            label="Bề ngang vai (cm)"
            name="shoulder"
            type="number"
            min="25"
            max="70"
            defaultValue={meta.shoulder ?? ""}
            data-testid="shoulder-input"
          />
        </div>
      </AccountInfo>
    </form>
  )
}

export default ProfileBodyMeasurements
