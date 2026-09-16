/**
 * Shared backend envelope types (backend_analysis.md §1). Every controller
 * returns `ApiResponse<T>`; paginated endpoints wrap the payload as
 * `ApiResponse<PageResponse<T>>`. This is the single source of truth for
 * these shapes — `axiosInstance.ts` and every feature API module import
 * from here instead of re-declaring an ad hoc envelope type.
 */

/**
 * IMPORTANT — nullability convention for every type in this codebase: the
 * backend serializes with `@JsonInclude(NON_NULL)`, so a field that's null
 * server-side is OMITTED from the JSON entirely rather than sent as
 * `"field": null`. In JS that means reading it comes back `undefined`, not
 * `null`. Typing an optional field as just `T | null` is a lie that lets
 * `undefined` sail past TypeScript and crash at runtime (this has already
 * caused one real bug — a `.toFixed()` call on an "optional" rating). Use
 * `Nullable<T>` for every optional backend field, and check it with loose
 * `== null` / `!= null` (or `??`), never strict `=== null` / `!== null`.
 */
export type Nullable<T> = T | null | undefined

/** `ApiResponse.ErrorDetail` (backend_analysis.md §1). */
export interface ApiError {
  code: string
  message: string
  details?: Record<string, string> | null
}

/** `ApiResponse<T>` (backend_analysis.md §1). `error`/`data` are mutually
 * exclusive and both nullable (`@JsonInclude(NON_NULL)` — either field may
 * be entirely absent from the JSON, not just `null`). */
export interface ApiResponse<T> {
  success: boolean
  message: Nullable<string>
  data: Nullable<T>
  error: Nullable<ApiError>
  timestamp: string
}

/**
 * `PageResponse<T>` (backend_analysis.md §1). The doc flags a real
 * Lombok/Jackson ambiguity: `private boolean isFirst`/`isLast` fields may
 * serialize as JSON keys `"isFirst"`/`"isLast"` *or* `"first"`/`"last"`
 * depending on how Lombok's getter is generated. Rather than guess, both
 * spellings are typed as optional here — use `getIsFirst`/`getIsLast`
 * below everywhere instead of reading either raw field name directly, so a
 * live-API surprise is a one-line fix in this file, not a hunt through
 * every call site.
 */
export interface PageResponse<T> {
  content: T[]
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
  isFirst?: boolean
  first?: boolean
  isLast?: boolean
  last?: boolean
  hasNext: boolean
  hasPrevious: boolean
}

/** Normalizer for the `isFirst`/`first` serialization ambiguity above. */
export function getIsFirst(page: Pick<PageResponse<unknown>, 'isFirst' | 'first'>): boolean {
  return page.isFirst ?? page.first ?? false
}

/** Normalizer for the `isLast`/`last` serialization ambiguity above. */
export function getIsLast(page: Pick<PageResponse<unknown>, 'isLast' | 'last'>): boolean {
  return page.isLast ?? page.last ?? false
}

/** An empty page, used as a safe default before the first successful fetch
 * (e.g. `placeholderData` seeding or a fallback for an errored query). */
export function emptyPage<T>(pageSize = 20): PageResponse<T> {
  return {
    content: [],
    pageNumber: 0,
    pageSize,
    totalElements: 0,
    totalPages: 0,
    isFirst: true,
    isLast: true,
    hasNext: false,
    hasPrevious: false,
  }
}
