"use client"

const COOKIE_PREFIX = "_personalization_"
const CATEGORY_IDS_COOKIE = `${COOKIE_PREFIX}category_ids`
const COLLECTION_ID_COOKIE = `${COOKIE_PREFIX}collection_id`
const RECENT_PRODUCT_IDS_COOKIE = `${COOKIE_PREFIX}recent_product_ids`

const COOKIE_MAX_AGE = 60 * 60 * 24 * 90 // 90 days in seconds

/**
 * Sets a cookie with the given name, value, and expiration
 */
function setCookie(name: string, value: string, maxAge: number = COOKIE_MAX_AGE) {
    document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`
}

/**
 * Gets a cookie value by name
 */
function getCookie(name: string): string | null {
    if (typeof document === "undefined") return null

    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) {
        return parts.pop()?.split(";").shift() || null
    }
    return null
}

/**
 * Sets/updates the category_ids cookie with a single category ID
 * This will override any existing category_ids cookie
 */
export function setCategoryCookie(categoryId: string) {
    setCookie(CATEGORY_IDS_COOKIE, categoryId)
}

/**
 * Sets/updates the collection_id cookie
 */
export function setCollectionCookie(collectionId: string) {
    setCookie(COLLECTION_ID_COOKIE, collectionId)
}

/**
 * Adds a product ID to the recently viewed products array (max 10, FIFO)
 */
export function addRecentProduct(productId: string) {
    const existing = getCookie(RECENT_PRODUCT_IDS_COOKIE)
    let products: string[] = []

    if (existing) {
        // Parse comma-separated string into array
        products = existing.split(",").map((id) => id.trim()).filter(Boolean)
    }

    // Remove the product if it already exists (to move it to the front)
    products = products.filter((id) => id !== productId)

    // Add to the beginning
    products.unshift(productId)

    // Keep only the 10 most recent
    if (products.length > 10) {
        products = products.slice(0, 10)
    }

    // Store as comma-separated string
    setCookie(RECENT_PRODUCT_IDS_COOKIE, products.join(","))
}

/**
 * Updates the category_ids cookie with all product category IDs (comma-separated)
 */
export function updateProductCategories(categoryIds: string[]) {
    if (categoryIds.length === 0) {
        return
    }

    // Store as comma-separated string
    const value = categoryIds.join(",")
    setCookie(CATEGORY_IDS_COOKIE, value)
}

/**
 * Updates the collection_id cookie if product has a collection
 */
export function updateProductCollection(collectionId: string | null) {
    if (collectionId) {
        setCollectionCookie(collectionId)
    }
}

