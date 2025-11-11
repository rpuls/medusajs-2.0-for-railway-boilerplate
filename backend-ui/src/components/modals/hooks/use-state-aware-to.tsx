import { useMemo } from "react"
import { Path, useLocation } from "react-router-dom"

/**
 * Checks if the current location has a restore_params property.
 * If it does, it will return a new path with the params added to it.
 * Otherwise, it will return the previous path.
 *
 * This is useful if the modal needs to return to the original path, with
 * the params that were present when the modal was opened.
 */
export const useStateAwareTo = (prev: string | Partial<Path>) => {
  const location = useLocation()

  const to = useMemo(() => {
    const params = location.state?.restore_params

    if (!params) {
      return prev
    }

    return `${prev}?${params.toString()}`
  }, [location.state, prev])

  return to
}
