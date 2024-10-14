"use client"

import { useFormState } from "react-dom"

import Input from "@modules/common/components/input"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { signup } from "@lib/data/customer"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Register = ({ setCurrentView }: Props) => {
  const [message, formAction] = useFormState(signup, null)

  return (
    <div
      className="max-w-sm flex flex-col items-center"
      data-testid="register-page"
    >
      <h1 className="text-large-semi uppercase mb-6">
        Bine ai venit!
      </h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-4">
        Devino membru pentru mai multe avantaje
      </p>
      <form className="w-full flex flex-col" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
        <Input
            label="Nume"
            name="last_name"
            required
            autoComplete="family-name"
            data-testid="last-name-input"
          />
          <Input
            label="Prenume"
            name="first_name"
            required
            autoComplete="given-name"
            data-testid="first-name-input"
          />
  
          <Input
            label="Email"
            name="email"
            required
            type="email"
            autoComplete="email"
            data-testid="email-input"
          />
          <Input
            label="Numar Telefon"
            name="phone"
            type="tel"
            autoComplete="tel"
            data-testid="phone-input"
          />
          <Input
            label="Parola"
            name="password"
            required
            type="password"
            autoComplete="new-password"
            data-testid="password-input"
          />
        </div>
        <ErrorMessage error={message} data-testid="register-error" />
        <span className="text-center text-ui-fg-base text-small-regular mt-6">
          Atunci cand apesi pe butonul de Inregistrare, inseamna ca esti de acord cu
          <LocalizedClientLink
            href="/content/privacy-policy"
            className="underline"
          >
            Termenii
          </LocalizedClientLink>{" "}
          si{" "}
          <LocalizedClientLink
            href="/content/terms-of-use"
            className="underline"
          >
            Conditiile
          </LocalizedClientLink>
          .
        </span>
        <SubmitButton className="w-full mt-6" data-testid="register-button">
          INREGISTRARE
        </SubmitButton>
      </form>
      <span className="text-center text-ui-fg-base text-medium-regular mt-6">
        Ai deja un cont?{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="underline"
        >
          Autentifica-te
        </button>
        .
      </span>
    </div>
  )
}

export default Register
