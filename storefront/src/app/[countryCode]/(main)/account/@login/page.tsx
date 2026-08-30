import { Metadata } from "next"

import LoginTemplate from "@modules/account/templates/login-template"
import { getStoreName } from "@lib/util/env"

export const metadata: Metadata = {
  title: "Sign in",
  description: `Sign in to your ${getStoreName()} account.`,
}

export default function Login() {
  return <LoginTemplate />
}
