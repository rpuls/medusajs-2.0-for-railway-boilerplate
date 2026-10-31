import { MedusaContainer } from '@medusajs/framework/types'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import { Client } from 'ssh2'
import { gzipSync } from 'zlib'
import { OPENAI_FEED_SFTP, STOREFRONT_URL } from '../lib/constants'

/**
 * Uploads the storefront's OpenAI product feed to OpenAI's SFTP server, so
 * the store's products can appear in ChatGPT's shopping results.
 *
 * OpenAI never fetches a feed from a URL, unlike Google Merchant Center: an
 * approved merchant pushes a full snapshot at least daily, under a stable
 * file name in the SFTP root, and OpenAI takes whatever sits there once it
 * stops changing. It accepts csv.gz but not plain csv, hence the gzip.
 *
 * The feed itself is built by the storefront (storefront/src/app/feeds), from
 * the same Store API calls as the product pages, so the prices and links in
 * it are the ones a shopper sees. This job only carries it across.
 *
 * Runs only with OPENAI_FEED_SFTP_* set (src/lib/constants.ts). Until OpenAI
 * has approved the store there is nothing to set, and the job returns at once.
 */

/** Stable, as OpenAI asks: each upload replaces the previous snapshot. */
const REMOTE_FILE = 'products.csv.gz'
const TIMEOUT_MS = 30_000

const upload = (data: Buffer): Promise<void> =>
  new Promise((resolve, reject) => {
    const client = new Client()
    const fail = (error: Error) => {
      client.end()
      reject(error)
    }

    client
      .on('ready', () => {
        client.sftp((error, sftp) => {
          if (error) return fail(error)
          sftp.writeFile(REMOTE_FILE, data, (writeError) => {
            client.end()
            if (writeError) return reject(writeError)
            resolve()
          })
        })
      })
      .on('error', fail)
      .connect({
        host: OPENAI_FEED_SFTP.host,
        port: OPENAI_FEED_SFTP.port,
        username: OPENAI_FEED_SFTP.username,
        password: OPENAI_FEED_SFTP.password,
        privateKey: OPENAI_FEED_SFTP.privateKey,
        readyTimeout: TIMEOUT_MS,
      })
  })

export default async function pushOpenAiFeed(container: MedusaContainer) {
  const { host, username, password, privateKey, country } = OPENAI_FEED_SFTP
  if (!host || !username || !(password || privateKey)) return

  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const feedUrl = `${STOREFRONT_URL}/feeds/openai/${country}.csv`

  try {
    const response = await fetch(feedUrl, { signal: AbortSignal.timeout(TIMEOUT_MS) })
    if (!response.ok) {
      throw new Error(`${feedUrl} answered ${response.status}`)
    }
    const csv = await response.text()
    // The header alone is not a catalogue. Uploading it would replace the
    // last good snapshot with an empty one and take every product off
    // ChatGPT, so a store that briefly lists nothing keeps the previous feed.
    const firstBreak = csv.indexOf('\n')
    if (firstBreak === -1 || !csv.slice(firstBreak + 1).trim()) {
      logger.warn(`OpenAI feed: ${feedUrl} lists no products, so the previous upload stays in place.`)
      return
    }

    const gzipped = gzipSync(csv)
    await upload(gzipped)
    logger.info(
      `OpenAI feed: uploaded ${REMOTE_FILE} (${Math.ceil(gzipped.length / 1024)} KB) from ${feedUrl}.`
    )
  } catch (error) {
    // The message names the host or the URL at most, never the credentials.
    logger.error(`OpenAI feed: upload failed: ${(error as Error).message}`)
  }
}

export const config = {
  name: 'push-openai-feed',
  // Daily, at a quiet hour in most of the US, which is the market OpenAI's
  // standard feed serves.
  schedule: '0 9 * * *',
}
