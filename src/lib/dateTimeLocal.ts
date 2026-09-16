/** Converts an ISO Instant string to the value a native
 * `<input type="datetime-local">` expects (`"YYYY-MM-DDTHH:mm"`, the
 * browser's local time, no seconds/timezone). Used wherever an admin form
 * edits an existing ISO-datetime field (event start/end times) with a
 * plain datetime-local input. */
export function toDatetimeLocalValue(iso: string): string {
  const date = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}
