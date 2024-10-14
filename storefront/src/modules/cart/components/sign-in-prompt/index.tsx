import { Button, Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const SignInPrompt = () => {
  return (
    <div className="bg-white flex items-center justify-between">
      <div>
        <Heading level="h2" className="txt-xlarge">
          Ai deja un cont?
        </Heading>
        <Text className="txt-medium text-ui-fg-subtle mt-2">
          logheaza-te pentru a putea cumpara produse
        </Text>
      </div>
      <div>
        <LocalizedClientLink href="/account">
          <Button variant="secondary" className="h-10" data-testid="sign-in-button">
            Autentificare
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default SignInPrompt
