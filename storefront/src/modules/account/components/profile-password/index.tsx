"use client"

import React from "react"

import AccountInfo from "../account-info"
import { HttpTypes } from "@medusajs/types"

type MyInformationProps = {
  customer: HttpTypes.StoreCustomer
}

/**
 * Read-only until the password reset flow exists.
 *
 * Changing a password in Medusa v2 is not a single call: it needs
 * `sdk.auth.resetPassword` to issue a token by email, then
 * `sdk.auth.updateProvider` to set the new password with that token. The
 * backend has no `auth.password_reset` subscriber and no reset email template,
 * so neither half is in place yet.
 *
 * This section previously rendered old/new/confirm password inputs wired to
 * `useActionState((() => {}) as any, ...)`, an action that did nothing at all.
 */
const ProfilePassword: React.FC<MyInformationProps> = ({ customer }) => {
  return (
    <div className="w-full">
      <AccountInfo
        label="Password"
        currentInfo={
          <span>The password is not shown for security reasons</span>
        }
        isEditable={false}
        clearState={() => {}}
        data-testid="account-password-editor"
      />
    </div>
  )
}

export default ProfilePassword
