import { useEffect, useState } from 'react'

/** Returns `value`, updated only after it has stopped changing for
 * `delayMs`. Used to keep search-as-you-type inputs from firing a network
 * request on every keystroke. */
export function useDebouncedValue<T>(value: T, delayMs = 400): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedValue(value), delayMs)
    return () => window.clearTimeout(timeoutId)
  }, [value, delayMs])

  return debouncedValue
}
