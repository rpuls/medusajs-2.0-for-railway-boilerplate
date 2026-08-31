/**
 * Assert that a value is not undefined. If it is, throw an error with the provided message.
 * @param v - Value to assert
 * @param errorMessage - Error message to throw if value is undefined
 */
export function assertValue<T extends string | undefined>(
  v: T | undefined,
  errorMessage: string,
): T {
  if (v === undefined) {
    throw new Error(errorMessage)
  }

  return v
}

/**
 * Placeholder secrets that ship in this repository, and the handful of values
 * people reach for when they mean "I will change this later".
 *
 * `supersecret` is the one that matters: it is what `.env.template` contains
 * for both JWT_SECRET and COOKIE_SECRET, so anyone who deploys without
 * changing it is signing admin sessions with a value published on GitHub.
 */
const KNOWN_WEAK_SECRETS = new Set([
  'supersecret',
  'secret',
  'changeme',
  'change-me',
  'password',
  'test',
])

/**
 * Warns, loudly and once per boot, when a production deployment is still using
 * a placeholder secret.
 *
 * Deliberately a warning and not a hard failure. Roughly 600 stores are already
 * running from this template and an unknown number of them are on the
 * placeholder; throwing here would take every one of them offline on their next
 * redeploy, turning a latent risk into an outage. The startup log is where a
 * deployer will actually see it, and it costs them nothing to ignore.
 *
 * Only fires under NODE_ENV=production, so local development stays quiet.
 */
export function warnIfWeakSecret(name: string, value: string | undefined): void {
  if (process.env.NODE_ENV !== 'production') return
  if (!value || !KNOWN_WEAK_SECRETS.has(value.trim().toLowerCase())) return

  console.warn(
    [
      '',
      '  ============================================================',
      `  SECURITY: ${name} is still set to a placeholder value.`,
      '',
      '  This value is published in this repository, so anyone can',
      '  reproduce it and sign valid tokens for your store.',
      '',
      '  Set it to a random string in your host\'s environment variables:',
      '    node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"',
      '',
      '  Changing JWT_SECRET or COOKIE_SECRET signs out existing',
      '  sessions once, which is the entire cost of fixing it.',
      '  ============================================================',
      '',
    ].join('\n')
  )
}
