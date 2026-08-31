# Security Policy

## Scope

This repository is a deployment template. It contains Railway wiring,
configuration, integration setup and a copy of the Medusa Next.js starter
storefront. It does **not** fork or patch Medusa itself.

That split decides where a report belongs:

| Where the problem is | Report it |
| -------------------- | --------- |
| This template's configuration, scripts, API routes, storefront code or documented defaults | Here, see below |
| Medusa core, its modules, or the admin dashboard | To [MedusaJS](https://github.com/medusajs/medusa/security), not here |
| Railway the platform | To [Railway](https://railway.com/) |
| A third-party integration (Stripe, Resend, MeiliSearch, your S3 provider) | To that vendor |

If you are not sure, report it here and it will be routed.

## Supported versions

Only the current `master` branch is supported. This is a template: there are no
maintained release branches, and the fix for anything found here is to take the
latest code and redeploy.

## Reporting a vulnerability

Use GitHub's private vulnerability reporting: open the
[Security tab](https://github.com/rpuls/medusajs-2.0-for-railway-boilerplate/security)
and choose **Report a vulnerability**. That creates a private advisory visible
only to you and the maintainer.

Please do **not** open a public issue for anything that would let someone take
over a deployed store, read another store's data, or extract credentials.
Roughly 600 stores run from this template, and a public issue tells everyone at
once, including the people who would use it.

If GitHub advisories are unavailable to you, get in touch through
[funkyton.com](https://funkyton.com/) and ask for a private channel.

Include what you would want to receive: what you did, what happened, what you
expected, and whether you have confirmed it on a real deploy or only read the
code. A proof of concept is welcome but not required.

**What to expect.** This is a community project maintained by one person, so
there is no paid response window. Realistically: an acknowledgement within a
few days, and a fix prioritised over everything else if it is exploitable
against deployed stores. You will be credited in the advisory unless you ask
not to be.

## Things that are already known, and are not vulnerabilities

Save yourself the write-up on these.

- **`/key-exchange` is unauthenticated.** It returns the store's *publishable*
  API key, which is public by design and already ships in the storefront's
  client bundle. The route exists because the storefront and backend deploy
  independently and the key does not exist until the backend has seeded. The
  caller is a build step with no session, no cookies and no origin header,
  so there is nothing to authenticate against.
- **The seeded demo catalogue is public.** That is the point of a demo store.
- **The password reset endpoint is not rate limited.** `POST /auth/{actor}/emailpass/reset-password`
  is Medusa's own route and takes no authentication, so it can be called
  repeatedly to fill a known customer's inbox. It is an abuse and cost problem,
  not an account compromise: each new token invalidates the previous one, the
  token is single use, it expires in 15 minutes, and it is only ever sent to the
  address already on the account. A report with a concrete way to *use* a reset
  token you were not sent is very welcome; a report that the endpoint can be
  called twice is already known.
- **The reset endpoint answers the same for an unknown address.** That is
  deliberate, so it cannot be used to work out which addresses have accounts.
  The storefront copy is worded to match.
- **`.env.template` contains `supersecret`.** It is a placeholder, it is
  labelled as one, and the backend prints a warning at boot when a production
  deploy is still using it. If you find a *deployed* store running on it, that
  is a finding about that store, and its owner is the person to tell.

## If you deployed this template

Two settings are yours to get right, and neither is fixed by updating the code:

1. **Change `JWT_SECRET` and `COOKIE_SECRET`** from the placeholder. They sign
   admin sessions. Generate one with
   `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
2. **Change `MEDUSA_ADMIN_PASSWORD`** before the first boot, or change the
   password in the dashboard afterwards. It is the login to your own store.

Check them in your host's environment variables rather than assuming. Anything
copied from `.env.template` and left alone is a published value.
