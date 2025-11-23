/**
 * Lightweight deep equality check to replace lodash.isEqual
 * Optimized for common use cases (objects, arrays, primitives)
 */

export function isEqual(a: any, b: any): boolean {
  // Same reference
  if (a === b) return true

  // Different types
  if (typeof a !== typeof b) return false

  // null or undefined
  if (a == null || b == null) return a === b

  // Primitives
  if (typeof a !== 'object') return a === b

  // Arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (!isEqual(a[i], b[i])) return false
    }
    return true
  }

  // One is array, other is not
  if (Array.isArray(a) || Array.isArray(b)) return false

  // Objects
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)

  if (keysA.length !== keysB.length) return false

  for (const key of keysA) {
    if (!keysB.includes(key)) return false
    if (!isEqual(a[key], b[key])) return false
  }

  return true
}

