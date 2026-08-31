import { test, expect, APIRequestContext } from "@playwright/test"
import { qaEnv } from "./helpers"

/**
 * Covers product media storage, which was the last headline feature of this
 * template with no automated check at all.
 *
 * It is a good candidate for silent breakage. The backend falls back to local
 * disk whenever the `S3_*` variables are incomplete, and on Railway that disk
 * is ephemeral: uploads work, images display, and then vanish on the next
 * deploy. `medusa-config.js` warns about a partial configuration at boot, but a
 * warning in a deploy log is not a test.
 *
 * Everything here goes through the admin API rather than the dashboard UI. The
 * question is whether the file reaches storage and can be read back by a
 * browser with no credentials, which is what a product image actually needs,
 * and neither half is visible from the storefront.
 */

/** A 1x1 transparent PNG. Small enough to be free, real enough to be an image. */
const PIXEL_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64"
)

type UploadedFile = { id: string; url: string }

const adminToken = async (request: APIRequestContext): Promise<string> => {
  const res = await request.post(`${qaEnv.backendURL}/auth/user/emailpass`, {
    data: { email: qaEnv.adminEmail, password: qaEnv.adminPassword },
  })
  expect(res.ok(), "admin sign-in to upload a file").toBeTruthy()
  return (await res.json()).token
}

const upload = async (
  request: APIRequestContext,
  token: string
): Promise<UploadedFile> => {
  const res = await request.post(`${qaEnv.backendURL}/admin/uploads`, {
    headers: { Authorization: `Bearer ${token}` },
    multipart: {
      files: {
        name: `qa-upload-${Date.now().toString(36)}.png`,
        mimeType: "image/png",
        buffer: PIXEL_PNG,
      },
    },
  })

  expect(
    res.ok(),
    `Upload failed with ${res.status()}. Check the S3_* variables on the backend; ` +
      `an incomplete set falls back to local disk instead of failing loudly.`
  ).toBeTruthy()

  const file = (await res.json()).files?.[0]
  expect(file?.url, "the upload response carried no URL").toBeTruthy()
  return file
}

const remove = async (
  request: APIRequestContext,
  token: string,
  id: string
) => {
  await request.delete(`${qaEnv.backendURL}/admin/uploads/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

test.describe("Product media storage", () => {
  test("an uploaded image is readable by anyone, which is what a product image needs", async ({
    request,
  }) => {
    const token = await adminToken(request)
    const file = await upload(request, token)

    try {
      // No Authorization header on purpose. A shopper's browser has none, and
      // an object that only opens for an authenticated caller is a broken
      // product image however healthy the upload looked.
      const fetched = await request.get(file.url)

      expect(
        fetched.status(),
        `The uploaded file is not publicly readable at ${file.url}. ` +
          `Medusa's S3 provider serves product images straight from this URL, so ` +
          `the bucket needs public read access through a bucket policy, or a public ` +
          `proxy in front of it. Note that Railway's own buckets were private-only ` +
          `as of July 2026.`
      ).toBe(200)

      expect(
        fetched.headers()["content-type"],
        "the storage returned something that is not an image"
      ).toContain("image")

      expect(
        (await fetched.body()).length,
        "the stored file came back a different size to the one uploaded"
      ).toBe(PIXEL_PNG.length)
    } finally {
      await remove(request, token, file.id)
    }
  })

  test("deleting an upload really removes it from storage", async ({
    request,
  }) => {
    const token = await adminToken(request)
    const file = await upload(request, token)

    expect((await request.get(file.url)).status()).toBe(200)

    await remove(request, token, file.id)

    // Proves the delete reaches the same storage the upload wrote to, rather
    // than only dropping a database row and leaving the object orphaned.
    await expect
      .poll(async () => (await request.get(file.url)).status(), {
        timeout: 20_000,
        intervals: [1000],
        message: `${file.url} is still served after being deleted`,
      })
      .not.toBe(200)
  })

  test("uploading requires an admin session", async ({ request }) => {
    const res = await request.post(`${qaEnv.backendURL}/admin/uploads`, {
      multipart: {
        files: {
          name: "qa-unauthenticated.png",
          mimeType: "image/png",
          buffer: PIXEL_PNG,
        },
      },
    })

    expect(
      res.status(),
      "anyone can upload files to this store's media storage"
    ).toBe(401)
  })
})
