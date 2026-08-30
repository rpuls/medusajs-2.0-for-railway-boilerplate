"use client"

import React from "react"

import AccountInfo from "../account-info"
import { HttpTypes } from "@medusajs/types"

type MyInformationProps = {
  customer: HttpTypes.StoreCustomer
}

/**
 * Read-only on purpose. Medusa's store API declares
 * `StoreUpdateCustomer extends Omit<BaseUpdateCustomer, "email">`, so a
 * customer's email cannot be changed from the storefront: it is tied to the
 * auth identity. This section previously rendered an editable form whose save
 * call was commented out and which reported success regardless, telling
 * customers their email had changed when nothing happened.
 */
const ProfileEmail: React.FC<MyInformationProps> = ({ customer }) => {
  return (
    <div className="w-full">
      <AccountInfo
        label="Email"
        currentInfo={`${customer.email}`}
        isEditable={false}
        clearState={() => {}}
        data-testid="account-email-editor"
      />
    </div>
  )
}

export default ProfileEmail
