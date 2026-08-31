import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { IApiKeyModuleService } from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';

/**
 * Hands the storefront its publishable API key.
 *
 * `medusajs-launch-utils` calls this on every storefront boot when
 * NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY is not already set, which is the normal
 * case on Railway: the two services are deployed independently and the key is
 * created by the backend, so there is nothing to paste in beforehand.
 *
 * Deliberately unauthenticated. Publishable keys are public by design - they
 * ship in the storefront's client bundle - and the caller here is a build step
 * with no session, no cookies and no origin header, so there is nothing to
 * check against. What this route must not do is leak anything that is *not*
 * public, which is why the catch below no longer echoes the error message.
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const apiKeyModuleService: IApiKeyModuleService = req.scope.resolve(Modules.API_KEY);

    // Filter in the query rather than in memory: listApiKeys() returns secret
    // keys too, and the old code's title match was the only thing keeping one
    // of those from being handed out if it happened to be called 'Webshop'.
    const publishableKeys = await apiKeyModuleService.listApiKeys({ type: 'publishable' });
    const usableKeys = publishableKeys.filter((apiKey) => !apiKey.revoked_at);

    // 'Webshop' is the title this template's seed gives the key, so prefer it.
    // Falling back to any other publishable key fixes the most common boot
    // failure on this template: a store whose key was created by hand in the
    // admin, or renamed, leaves the storefront retrying five times and then
    // starting with no key at all, and every request 400s with
    // "Publishable API key required".
    const defaultApiKey =
      usableKeys.find((apiKey) => apiKey.title === 'Webshop') ?? usableKeys[0];

    if (!defaultApiKey) {
      // 404 rather than the old 200 with an empty body. An empty object is not
      // a successful key exchange, and the caller treats both identically
      // (axios throws, withRetry retries), so this only makes the failure
      // legible in the deploy log.
      res.status(404).json({
        message:
          'No publishable API key exists yet. It is created when the backend seeds; ' +
          'if seeding has run, create one in Settings > Publishable API Keys.'
      });
      return;
    }

    res.json({ publishableApiKey: defaultApiKey.token });
  } catch (error) {
    // The message can carry connection strings and internal paths, and this
    // route is reachable by anyone.
    console.error('key-exchange failed:', error);
    res.status(500).json({ message: 'Could not read the publishable API key.' });
  }
}
