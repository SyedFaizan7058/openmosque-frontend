OpenMosque Backend — Frontend Integration Reference

Source of truth: actual Java source in D:\Open-Mosque\src\main\java\com\openmosque\** (read directly from the repo on 2026-09-12), cross-checked against OPEN_MOSQUE_DOCUMENTATION.md and all_api_urls.txt. Where the two disagree, this document follows the code and flags the discrepancy explicitly in the last section.

Stack: Spring Boot 3.3.3, Java 17, PostgreSQL + PostGIS, Firebase Admin SDK 9.3.0 (stateless JWT), Redis (cache + rate limiting), Flyway, MapStruct, SpringDoc OpenAPI (/swagger-ui.html, /v3/api-docs).

1. Universal Envelope

Every controller returns ResponseEntity<ApiResponse<T>>. Paginated endpoints wrap the payload as ApiResponse<PageResponse<T>>.

ApiResponse<T> (common/model/ApiResponse.java)
json
{
  "success": true,
  "message": "Human readable message (nullable)",
  "data": { "...": "T, or null on error" },
  "error": { "code": "STRING_CODE", "message": "...", "details": { "field": "msg" } },
  "timestamp": "2026-08-27T10:00:00Z"
}

Fields (@JsonInclude(NON_NULL) — null fields are omitted from JSON entirely, don't assume they're always present):

success: boolean
message: string | null
data: T | null
error: ErrorDetail | null — nested class ApiResponse.ErrorDetail { code: string, message: string, details: Map<string,string> | null }
timestamp: string (ISO-8601 Instant, defaults to Instant.now())
PageResponse<T> (common/model/PageResponse.java)
json
{
  "content": [ "T" ],
  "pageNumber": 0,
  "pageSize": 20,
  "totalElements": 137,
  "totalPages": 7,
  "isFirst": true,
  "isLast": false,
  "hasNext": true,
  "hasPrevious": false
}

Built via PageResponse.from(Page<T>). Field names are exactly pageNumber/pageSize (not page/size) and isFirst/isLast/hasNext/hasPrevious as booleans (Jackson serializes Lombok isXxx as xxx normally, but note these are plain boolean isFirst fields on a @Data class — Jackson will emit them as "first"/"last" unless Lombok generated isFirst(); the actual getter Lombok generates for private boolean isFirst is isFirst(), which Jackson serializes as JSON key "first". Verify against a live response — this is a common Lombok/Jackson gotcha the frontend should test for rather than assume isFirst vs first).

Error codes emitted (GlobalExceptionHandler.java)
HTTP	error.code	Trigger
400	BAD_REQUEST	BadRequestException (business rule violation)
400	VALIDATION_FAILED	@Valid DTO field errors (error.details = {field: message}) or @RequestParam/@PathVariable constraint violations
400	MALFORMED_JSON	Unparseable request body
401	UNAUTHORIZED	UnauthorizedException, missing/invalid Spring Security auth, or the custom AuthenticationEntryPoint
403	FORBIDDEN	ForbiddenException or the custom AccessDeniedHandler
403	ACCESS_DENIED	@PreAuthorize role check failure (Spring's own AccessDeniedException)
403	ACCOUNT_DISABLED	User is deactivated/soft-deleted (thrown from FirebaseAuthFilter itself, before reaching a controller)
404	RESOURCE_NOT_FOUND	ResourceNotFoundException
409	RESOURCE_ALREADY_EXISTS	ConflictException
409	CONFLICT	Raw DB unique-constraint violation (DataIntegrityViolationException) not caught by service code
405	METHOD_NOT_ALLOWED	Wrong HTTP verb
429	RATE_LIMIT_EXCEEDED	Rate limiter tripped (see §6)
500	INTERNAL_SERVER_ERROR	Uncaught exception (message is always the generic string, never a stack trace)

Note: there is no dedicated 403 code differentiating "not your resource" from "wrong role" — both ForbiddenException (FORBIDDEN) and @PreAuthorize denial (ACCESS_DENIED) are used inconsistently across services; treat both as "show a permission-denied UI."

2. Auth & Security
2.1 Identity model

Zero passwords stored server-side. The frontend authenticates against Firebase Auth directly (Google Identity Platform) and sends the Firebase ID token to this backend, which verifies it via the Firebase Admin SDK and auto-provisions a local User row keyed on firebase_uid.

2.2 How the token reaches the backend — two supported mechanisms

FirebaseAuthFilter.extractBearerToken() checks, in order:

Authorization: Bearer <idToken> header, or
An HttpOnly cookie named om_access_token (also accepts a legacy/alternate name access_token).

There is a separate POST /api/v1/auth/session endpoint (AuthController) whose entire purpose is to take a token (body {token, refreshToken} or the Authorization header) and set it as HttpOnly cookies so the SPA doesn't need to hold the raw JWT in JS-accessible storage:

Cookie names: om_access_token (7-day maxAge) and om_refresh_token (30-day maxAge — but note the refresh token is not actually a Firebase refresh token; if the client doesn't supply one, the backend just stores token + "-refresh" as a placeholder value. There is no real token-refresh endpoint implemented — treat om_refresh_token as vestigial/non-functional today).
Cookie attributes: HttpOnly=true, Secure=<request.isSecure()> (so Secure is false over plain HTTP in local dev), Path=/, SameSite=Lax.
POST /api/v1/auth/logout clears both cookies (maxAge=0).
POST /api/v1/users/sync also sets om_access_token as a side-effect (using the raw firebaseUid as the cookie value — not the actual Firebase ID token; this looks like a bug/placeholder, not real session material — don't rely on it).

Frontend implication: for real production auth flows, send Authorization: Bearer <firebase-id-token> on every request (works with CORS credentials either way); the cookie-session mechanism exists but is only lightly wired up and one path (/users/sync) writes a non-functional cookie value.

2.3 Dev mock authentication (non-prod only)

When app.security.firebase.dev-mock-auth=true (default true in application-dev.yml, false in application-prod.yml) and the active profile does not contain "prod", any bearer token starting with mock- is accepted without real verification:

mock-<anything> → creates/uses a dev user, role USER.
mock-admin<anything> → creates/uses a dev user promoted to SUPER_ADMIN (only in this dev-mock path).
This is strictly disabled in production (FirebaseTokenVerifier.init() forces devMockAuthEnabled=false when profile contains prod).
2.4 New-user provisioning

On first sight of a valid token, FirebaseAuthFilter auto-creates a User row: role=USER, points=0, active=true, verified=false, email from the token claim (or <uid>@openmosque.org fallback), displayName from token or "Mosque Contributor". Suspended (is_active=false) or soft-deleted users get an immediate 403 ACCOUNT_DISABLED before the request reaches any controller.

2.5 @CurrentUser injection

Controllers get the authenticated User JPA entity injected directly via a custom @CurrentUser parameter annotation + CurrentUserArgumentResolver (backed by Spring Security's SecurityContextHolder → CustomUserDetails). No manual token parsing needed once past the filter.

2.6 Route authorization matrix (SecurityConfig.java, evaluated top-to-bottom, first match wins)
Pattern	Rule
/v3/api-docs/**, /swagger-ui/**, /swagger-ui.html, /actuator/health, /actuator/info	public
/api/v1/users/me/favorites/**, /api/v1/users/me/badges, /api/v1/users/me/notifications/**	authenticated (any logged-in role)
/api/v1/mosques/*/favorite, /api/v1/mosques/*/is-favorite	authenticated
GET /api/v1/badges, GET /api/v1/users/*/badges	public
GET /api/v1/mosques/**	public
GET /api/v1/prayer-times/**	public
GET /api/v1/facilities/**	public
GET /api/v1/calculation-methods/**	public (note: no controller actually maps this path — the real path is GET /api/v1/prayer-times/methods; this rule looks like dead/leftover config)
GET /api/v1/media/files/**	public (static file serving, see §6)
PUT /api/v1/media/upload, PUT /api/v1/media/mock-upload	public
/api/v1/auth/**	public (session, logout, and all of 2FA /api/v1/auth/2fa/** — see caveat below)
POST /api/v1/users/sync	public
/api/v1/admin/moderation/**, /api/v1/admin/mosques/claims/**, /api/v1/admin/community/**, /api/v1/admin/stats/**, /api/v1/admin/ingest/**	ROLE_MODERATOR or ROLE_SUPER_ADMIN
/api/v1/admin/users/**, everything else under /api/v1/admin/**	ROLE_SUPER_ADMIN only
/api/v1/mosque-admin/mosques/*/stats	ROLE_MOSQUE_ADMIN, ROLE_SUPER_ADMIN, or ROLE_MODERATOR
/api/v1/mosque-admin/** (everything else, incl. events/khutbahs/prayer-config/iqamah-schedule)	ROLE_MOSQUE_ADMIN or ROLE_SUPER_ADMIN
anything else	any authenticated user

Important discrepancy inside the security config itself: the URL-level rule matches /api/v1/auth/** as fully public, but TwoFactorAuthController (mapped at /api/v1/auth/2fa/**) carries its own class-level @PreAuthorize("isAuthenticated()"). Spring Security enforces both layers — the authorizeHttpRequests chain runs first and lets the request through as "permitted", but method security (@EnableMethodSecurity) then still evaluates @PreAuthorize on the controller method and will reject unauthenticated calls with 403. Net effect: all /api/v1/auth/2fa/* endpoints require login despite the URL matcher saying "permitAll" — build the frontend assuming 2FA endpoints need a bearer token/cookie, matching the @PreAuthorize truth, not the URL matcher.

2.7 CORS

SecurityConfig.corsConfigurationSource(), configured via app.cors.* properties:

Default allowed origins (application.yml, overridable by APP_CORS_ALLOWED_ORIGINS env var): http://localhost:3000,http://localhost:5173,https://*.vercel.app,http://localhost:19006,exp://*
Prod default (application-prod.yml): https://openmosque.org,https://openmosque.vercel.app
Allowed methods: GET,POST,PUT,PATCH,DELETE,OPTIONS
Allowed headers: Authorization, Content-Type, X-Requested-With, Accept, Origin, X-Device-Token
Exposed headers (readable by frontend JS): X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, Retry-After, Set-Cookie
allowCredentials=true unless origins contain a literal *, in which case credentials are forced off (cannot mix wildcard + credentialed cookies per spec). Because the actual observed .env for the frontend sets APP_CORS_ALLOWED_ORIGINS=http://localhost:5173,https://openmosque.org (no wildcard), credentials/cookies work fine in that configuration.
CSRF is disabled entirely (stateless JWT design). Session policy: STATELESS.
Extra hardening headers set unconditionally: HSTS (1yr, includeSubDomains), X-Frame-Options: DENY, X-Content-Type-Options: nosniff, CSP default-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'self', Referrer-Policy: strict-origin-when-cross-origin, Permissions-Policy: geolocation=(self), camera=(), microphone=().
2.8 2FA / TOTP flow (RFC 6238, TotpUtil.java + TwoFactorAuthService.java)

Fully custom (no external 2FA library) — 30-second time step, 6 digits, HMAC-SHA1, Base32 secret, ±1 window drift tolerance (Google/Microsoft Authenticator/Authy compatible).

POST /api/v1/auth/2fa/setup → generates a random 160-bit secret, stores it as twoFactorTempSecret (not yet active), returns {secret, qrCodeUri, manualEntryKey, instructions}. qrCodeUri is a standard otpauth://totp/OpenMosque:<email>?secret=...&issuer=OpenMosque&algorithm=SHA1&digits=6&period=30 string the frontend renders as a QR code.
POST /api/v1/auth/2fa/enable with {code} (the 6-digit code from the authenticator app) → verifies against the temp secret, on success commits it to twoFactorSecret, sets twoFactorEnabled=true, generates 8 backup codes (format XXXX-XXXX, alphabet excludes ambiguous chars 0,1,I,O), returns them once in backupCodes (only SHA-256 hashes are persisted — codes are never retrievable again).
POST /api/v1/auth/2fa/verify with {code} or {backupCode} → returns ApiResponse<Boolean>; a backup code is consumed (removed from the stored hash list) on successful use. Throws 401 UNAUTHORIZED on failure rather than returning false.
POST /api/v1/auth/2fa/disable with {code}/{backupCode} → step-up verification required, then clears all 2FA fields.
POST /api/v1/auth/2fa/regenerate-backup-codes with {code} → requires the TOTP code specifically (backup code not accepted here), invalidates old codes, returns 8 new raw codes.
GET /api/v1/auth/2fa/status → {enabled: boolean, remainingBackupCodes: int}.

Note: 2FA verification is not wired into the login/auth-filter pipeline at all — there is no server-side enforcement that blocks API access when 2FA is enabled but not yet challenged in the current session. verifyChallenge() is only invoked by the 2FA controller's own endpoints (and internally by disable/regenerate). The frontend is fully responsible for orchestrating the 2FA challenge step during its own login flow (e.g., call /verify right after Firebase sign-in, before treating the user as fully authenticated) — the backend will not reject a normal API call just because 2FA is enabled and unverified this session.

3. Enums (exact JSON string values)
Enum	Module	Values
UserRole	user	USER, MOSQUE_ADMIN, MODERATOR, SUPER_ADMIN
ClaimStatus	claim	PENDING, APPROVED, REJECTED
SubmissionStatus	moderation	PENDING, APPROVED, REJECTED
SubmissionType	moderation	NEW_MOSQUE, EDIT_SUGGESTION
MosqueStatus	mosque	ACTIVE, PENDING_REVIEW, INACTIVE
ContentStatus	community	PUBLISHED, FLAGGED, HIDDEN
FlagStatus	community	PENDING, RESOLVED, DISMISSED
QuestionStatus	community	OPEN, ANSWERED, FLAGGED, HIDDEN
TargetType	community (flags)	REVIEW, QUESTION, ANSWER
EventAudience	event	ALL, BROTHERS, SISTERS, YOUTH
EventType	event	HALAQAH, WORKSHOP, YOUTH_PROGRAM, CHARITY, RAMADAN, EID, COMMUNITY_MEETING, OTHER
NotificationType	notification	IQAMAH_CHANGE, SUBMISSION_APPROVED, SUBMISSION_REJECTED, CLAIM_APPROVED, CLAIM_REJECTED, BADGE_EARNED, QUESTION_ANSWERED, EVENT_ANNOUNCEMENT, SYSTEM_ANNOUNCEMENT
CalculationMethod	prayer	KARACHI, ISNA, MUSLIM_WORLD_LEAGUE, UMM_AL_QURA, EGYPTIAN, TEHRAN, GULF, KUWAIT, QATAR, SINGAPORE, FRANCE, TURKEY, RUSSIA, CUSTOM (each carries an internal Aladhan method id + display name, exposed via CalculationMethodDto)
JuristicSchool	prayer	STANDARD (Shafi/Maliki/Hanbali, shadow 1x), HANAFI (shadow 2x)
IqamahCalculationType	prayer	OFFSET_AFTER_ADHAN, FIXED_TIME

Facility codes are not an enum — they're free-text code strings in the facilities table, seeded by Flyway V2__init_mosques_and_facilities.sql. Current seeded values (fetch live via GET /api/v1/facilities for full metadata — name/description/icon can change): WUDU_AREA, WOMENS_SECTION, WHEELCHAIR_ACCESSIBILITY, PARKING, JANAZAH_SERVICES, LIBRARY, AIR_CONDITIONING, DAILY_HALAQAH.

Badge codes (also free-text, catalog in badges table, seeded by V11__init_favorites_and_badges.sql; use GET /api/v1/badges for live data):

code	name	category	thresholdPoints	Award trigger (from BadgeService)
PIONEER	Pioneer	SUBMISSION	0	First NEW_MOSQUE submission approved (awarded in ModerationService)
MOSQUE_EXPLORER	Mosque Explorer	LOYALTY	0	≥ 5 favorited mosques
CENTURION_CONTRIBUTOR	Centurion Contributor	POINTS	100	User reaches ≥ 100 contribution points
COMMUNITY_PILLAR	Community Pillar	POINTS	500	User reaches ≥ 500 contribution points
VERIFIED_IMAM	Verified Mosque Administrator	VERIFICATION	0	Mosque claim approved
DEVOTED_PATRON	Devoted Patron	LOYALTY	0	≥ 1 favorited mosque

Note thresholdPoints on the Badge catalog entity is informational metadata on the row, not what the code actually branches on — the real thresholds are hardcoded constants in BadgeService.evaluatePointsBadges()/evaluateFavoritesBadges() (100, 500, 1, 5) and happen to match the seed data, but don't rely on thresholdPoints being authoritative if an admin edits the badges table directly.

4. DTOs (fields, types, validation) — grouped by module

Validation annotations map directly to Zod: @NotBlank/@NotNull → .min(1)/required, @Email → .email(), @Size(min,max) → .min().max(), @Min/@Max/@DecimalMin/@DecimalMax → .min()/.max(), @Pattern(regexp) → .regex().

user module

UserSyncRequestDto (request, POST /api/v1/users/sync)

firebaseUid: string @NotBlank
email: string @NotBlank @Email
displayName: string?
phoneNumber: string?
photoUrl: string?
preferredCity: string?
preferredCountry: string?
latitude: number? (Double)
longitude: number? (Double)

UserResponseDto (response)

id: uuid, firebaseUid: string, email: string, displayName: string?, phoneNumber: string?, photoUrl: string?
role: UserRole
points: int
active: boolean, verified: boolean
preferredCity: string?, preferredCountry: string?, latitude: number?, longitude: number?
claimedMosqueIds: uuid[]
createdAt: ISO datetime

UserLocationUpdateRequestDto (request, PUT/PATCH /api/v1/users/me/location)

preferredCity: string? @Size(max=100)
preferredCountry: string? @Size(max=100)
latitude: number? @DecimalMin(-90.0) @DecimalMax(90.0)
longitude: number? @DecimalMin(-180.0) @DecimalMax(180.0)

UserRoleUpdateRequestDto (request, super-admin only)

role: UserRole @NotNull

BadgeDto (catalog response)

id: uuid, code: string, name: string, description: string, iconName: string, category: string, thresholdPoints: int, active: boolean, createdAt: ISO datetime

UserBadgeResponseDto (earned-badge response)

id: uuid (the award row id), badgeId: uuid, code: string, name: string, description: string, iconName: string, category: string, earnedAt: ISO datetime

TwoFactorSetupResponseDto: secret: string, qrCodeUri: string, manualEntryKey: string (== secret), instructions: string TwoFactorEnableResponseDto: enabled: boolean, backupCodes: string[], message: string TwoFactorStatusResponseDto: enabled: boolean, remainingBackupCodes: int TwoFactorVerifyRequestDto (request): code: string? @Size(6,6) (digits enforced only by length, not @Pattern), backupCode: string? @Size(8,12) — both optional at the DTO level; service logic requires at least one to actually verify.

mosque module

MosqueCreateRequestDto (not currently exposed by any controller — no POST /api/v1/mosques endpoint exists; creation only happens indirectly via approved submissions or OSM ingestion)

name: string @NotBlank, description: string?, address: string @NotBlank, city: string @NotBlank, state: string?, country: string @NotBlank, postalCode: string?
latitude: number @NotNull @DecimalMin(-90) @DecimalMax(90), longitude: number @NotNull @DecimalMin(-180) @DecimalMax(180)
contactPhone/contactEmail/websiteUrl/liveStreamUrl: string?
facilityCodes: string[]?, imageUrls: string[]?

MosqueUpdateRequestDto (request, PUT /api/v1/mosques/{id})

Same shape as create but latitude/longitude are primitive double (not Double, so 0.0 is the JSON-absent default, not null) and not @NotNull-validated for lat/lng; name/address/city/country still @NotBlank.

MosqueResponseDto (full profile, GET /api/v1/mosques/{idOrSlug})

id: uuid, name, slug, description?, address, city, state?, country, postalCode?
latitude: number, longitude: number (primitive double)
contactPhone?, contactEmail?, websiteUrl?, liveStreamUrl?
verified: boolean, status: MosqueStatus
facilities: MosqueFacilityDto[], images: MosqueImageDto[]
createdAt: ISO datetime
rating: number? (Double, average), reviewCount: int? (Integer, nullable)

MosqueSummaryDto (lightweight, used by /nearby and /search)

id, name, slug, address, city, state?, country
latitude: number, longitude: number
distanceKm: number? (only populated for /nearby, null for /search)
coverImageUrl?, verified: boolean, status: MosqueStatus, liveStreamUrl?
facilityCodes: string[], rating: number?, reviewCount: int?

MosqueFacilityDto: id: uuid, facilityId: uuid, facilityCode: string, facilityName: string, iconName?, customDetails? MosqueImageDto: id: uuid, imageUrl: string, caption?, cover: boolean, displayOrder: int FacilityDto (catalog): id: uuid, code: string, name: string, description?, iconName?, active: boolean

FavoriteMosqueResponseDto: mosqueId, name, slug, description?, address, city, state?, country, postalCode?, latitude: number?, longitude: number?, distanceKm: number?, coverImageUrl?, verified: boolean, facilityCodes: string[], favoritedAt: ISO datetime FavoriteStatusDto: mosqueId: uuid, favorite: boolean MosqueAdminStatsDto: totalFavorites: long, totalReviews: long, averageRating: double, ratingsBreakdown: Map<int,long> (star value → count), upcomingEventsCount: long, unansweredQuestionsCount: long

claim module

MosqueClaimSubmitDto (request, POST /api/v1/mosques/{id}/claim)

fullName: string @NotBlank
phoneNumber: string @NotBlank
officialEmail: string @NotBlank @Email
positionInMosque: string @NotBlank
proofDocumentUrl: string @NotBlank

MosqueClaimResponseDto: id, mosqueId, mosqueName, claimantId, claimantEmail, fullName, phoneNumber, officialEmail, positionInMosque, proofDocumentUrl, status: ClaimStatus, reviewerId?, reviewerName?, reviewComments?, reviewedAt: ISO datetime?, createdAt: ISO datetime MosqueClaimDecisionDto (request): status: ClaimStatus @NotNull, reviewComments: string?

moderation module

MosqueSubmissionRequestDto (request, used by both POST /mosques/submissions and POST /mosques/{id}/suggest-edit — controller overwrites submissionType/targetMosqueId server-side regardless of client input)

targetMosqueId: uuid? (server-controlled)
submissionType: SubmissionType (server-controlled, default NEW_MOSQUE)
name: string @NotBlank, description?, address: string @NotBlank, city: string @NotBlank, state?, country: string @NotBlank, postalCode?
latitude: number @NotNull @DecimalMin(-90) @DecimalMax(90), longitude: number @NotNull @DecimalMin(-180) @DecimalMax(180)
contactPhone?, contactEmail?, websiteUrl?, liveStreamUrl?
facilityCodes: string[]?, imageUrls: string[]?

MosqueSubmissionResponseDto: all the above plus id, submitterId, submitterName, submitterEmail, status: SubmissionStatus, reviewerId?, reviewerName?, reviewComments?, reviewedAt?, createdAt SubmissionDecisionDto (request): status: SubmissionStatus @NotNull, reviewComments: string? PlatformStatsDto: totalMosques, verifiedMosques, pendingSubmissions, pendingClaims, activeFlags, totalUsers — all long

community module

ReviewCreateDto (request): ratingOverall: int @NotNull @Min(1) @Max(5); ratingCleanliness/ratingFacilities/ratingWomensArea/ratingParking: int? each @Min(1) @Max(5) (optional); reviewText: string? ReviewResponseDto: id, mosqueId, userId, userDisplayName?, userPhotoUrl?, ratingOverall: int, ratingCleanliness?, ratingFacilities?, ratingWomensArea?, ratingParking?: int?, reviewText?, status: ContentStatus, createdAt RatingSummaryDto: totalReviews: long, averageOverall: double, averageCleanliness/averageFacilities/averageWomensArea/averageParking: number? (Double, null if no ratings yet) QuestionCreateDto (request): questionText: string @NotBlank QuestionResponseDto: id, mosqueId, userId, userDisplayName?, userPhotoUrl?, questionText, status: QuestionStatus, createdAt, answers: AnswerResponseDto[] AnswerCreateDto (request): answerText: string @NotBlank AnswerResponseDto: id, questionId, userId, userDisplayName?, userPhotoUrl?, answerText, officialMosqueAdmin: boolean, status: ContentStatus, createdAt ContentFlagCreateDto (request): targetType: TargetType @NotNull, targetId: uuid @NotNull, reason: string @NotBlank ContentFlagResponseDto: id, targetType, targetId, reporterId, reporterEmail?, reason, status: FlagStatus, reviewerId?, reviewerNotes?, createdAt FlagDecisionDto (request): status: FlagStatus @NotNull (only RESOLVED/DISMISSED are meaningful decisions), reviewerNotes: string?

event module

MosqueEventCreateDto (request, used for both create and update): title: string @NotBlank, description?, eventType: EventType @NotNull, audience: EventAudience (default ALL), startDateTime: ISO Instant @NotNull, endDateTime: ISO Instant @NotNull, locationDetails?, speakerName?, bannerImageUrl?, registrationUrl? MosqueEventResponseDto: id, mosqueId, mosqueName?, title, description?, eventType, audience, startDateTime, endDateTime, locationDetails?, speakerName?, bannerImageUrl?, registrationUrl?, cancelled: boolean, createdAt MosqueKhutbahCreateDto (request): khutbahDate: LocalDate @NotNull (YYYY-MM-DD), topic: string @NotBlank, khatibName: string @NotBlank, batchNumber: int (default 1), khutbahTime: LocalTime @NotNull (HH:mm:ss), adhaanTime?/iqamahTime?: LocalTime, language: string (default "English"), streamUrl?, recordingUrl?, notes? MosqueKhutbahResponseDto: id, mosqueId, mosqueName?, khutbahDate, topic, khatibName, batchNumber, khutbahTime, adhaanTime?, iqamahTime?, language, streamUrl?, recordingUrl?, notes?

prayer module

PrayerConfigDto: id, mosqueId, calculationMethod: CalculationMethod, calculationMethodDisplayName?, juristicSchool: JuristicSchool, timeZone, fajrAngle: number?, ishaAngle: number?, highLatitudeRule? PrayerConfigUpdateDto (request): calculationMethod: CalculationMethod @NotNull, juristicSchool: JuristicSchool @NotNull, timeZone?, fajrAngle?, ishaAngle?, highLatitudeRule? CalculationMethodDto: code: string, name: string, aladhanMethodId: int IqamahScheduleDto: id, mosqueId, then per-prayer (fajr/dhuhr/asr/maghrib/isha) each with {Prayer}Type: IqamahCalculationType, {prayer}OffsetMinutes: int?, {prayer}FixedTime: LocalTime?, plus optional adhan overrides {prayer}AdhanTime: LocalTime? for all five, plus jummah1Time/jummah2Time: LocalTime?, jummahKhutbahLanguage: string? IqamahScheduleUpdateDto (request): same shape but every {Prayer}Type is @NotNull (fixed/offset type required per-prayer even if the specific time value is optional) PrayerTimesDayResponseDto (composite response): mosqueId, mosqueName?, mosqueSlug?, date: LocalDate, hijriDate: string, timeZone, calculationMethod: string, calculationMethodName: string, juristicSchool: string, currentPrayer: string, nextPrayer: string, nextPrayerTime: string, timeRemainingMinutes: long?, timeRemainingFormatted: string, timings: SinglePrayerTimeDto[], jummahSchedule: FridayJummahScheduleDto SinglePrayerTimeDto: prayerName: string (FAJR|SUNRISE|DHUHR|ASR|MAGHRIB|ISHA), adhanTime: "HH:mm", iqamahTime: "HH:mm"? (null for SUNRISE), isNext: boolean, timeRemainingFormatted: string FridayJummahScheduleDto: firstJummahTime: "HH:mm", secondJummahTime: "HH:mm"?, khutbahLanguage: string?

media module

UploadUrlRequestDto (request, POST /api/v1/media/upload-url): fileName: string @NotBlank, contentType: string @NotBlank @Pattern(image/jpeg|image/png|image/webp|image/heic|application/pdf), folderCategory: string @NotBlank @Pattern(MOSQUE_IMAGE|PROOF_DOCUMENT|EVENT_BANNER|USER_AVATAR) UploadUrlResponseDto: uploadUrl: string, publicUrl: string, objectKey: string, expiresAt: ISO Instant

notification module

DeviceTokenRegisterDto (request): fcmToken: string @NotBlank @Size(max=500), deviceType: string (default "WEB", expected WEB|ANDROID|IOS — not enforced by @Pattern, just convention), deviceName: string? @Size(max=150) DeviceTokenResponseDto: id, fcmToken, deviceType, deviceName?, lastActiveAt, createdAt NotificationResponseDto: id, title, message, type: NotificationType, linkUrl?, metadataJson? (raw JSON string, frontend must JSON.parse itself), read: boolean, createdAt NotificationSummaryDto: unreadCount: long

ingestion module (OSM / admin-only)

CityIngestRequestDto (request): city: string @NotBlank, country: string?, dryRun: boolean (default false) RadiusIngestRequestDto (request): latitude: number @NotNull @Min(-90) @Max(90), longitude: number @NotNull @Min(-180) @Max(180), radiusMeters: number (default 10000.0) @NotNull @Min(100) @Max(100000), defaultCity?, defaultCountry?, dryRun: boolean (default false) BboxIngestRequestDto (request): south/west/north/east: number all @NotNull, lat fields @Min(-90)@Max(90), lon fields @Min(-180)@Max(180); defaultCity?, defaultCountry?, dryRun: boolean (default false) IngestionSummaryDto (response, shared by all 3 ingestion endpoints): totalElementsFetched: int, mosquesInserted: int, duplicatesSkipped: int, facilitiesAttached: int, dryRun: boolean, insertedMosqueNames: string[], durationMs: long OsmElementDto/OsmResponseDto: internal Overpass API deserialization shapes, not returned to the frontend directly.

5. Endpoints — every route found in the actual controllers

Format: METHOD /path — auth — request → response. "auth" values: public, user (any authenticated user), MODERATOR|SUPER_ADMIN, SUPER_ADMIN, MOSQUE_ADMIN|SUPER_ADMIN, MOSQUE_ADMIN|SUPER_ADMIN|MODERATOR. Where a mapping has multiple path aliases, all are listed on one line — they're the same handler.

Documentation / health (not in any of the app's own controllers, provided by Spring Boot/SpringDoc):

GET /v3/api-docs — public — raw OpenAPI 3 JSON
GET /swagger-ui.html — public — interactive docs UI
GET /actuator/health, GET /actuator/info — public
Users & Auth (AuthController, UserController, UserAdminController)
POST /api/v1/auth/session — public — request: {token?, refreshToken?} → ApiResponse<string> (sets om_access_token/om_refresh_token cookies)
POST /api/v1/auth/logout — public — none → ApiResponse<string> (clears cookies)
GET /api/v1/users/me — user — none → UserResponseDto
PUT /api/v1/users/me/location, PATCH /api/v1/users/me/location, PUT /api/v1/users/location, PATCH /api/v1/users/location — user — UserLocationUpdateRequestDto → UserResponseDto
POST /api/v1/users/sync — public — UserSyncRequestDto → UserResponseDto
PATCH /api/v1/admin/users/{id}/role — SUPER_ADMIN — UserRoleUpdateRequestDto → UserResponseDto
GET /api/v1/admin/users?role=&page=&size= — SUPER_ADMIN — none → PageResponse<UserResponseDto>
2FA (TwoFactorAuthController) — all require login despite URL matcher (see §2.6)
GET /api/v1/auth/2fa/status — user → TwoFactorStatusResponseDto
POST /api/v1/auth/2fa/setup — user → TwoFactorSetupResponseDto
POST /api/v1/auth/2fa/enable — user — TwoFactorVerifyRequestDto → TwoFactorEnableResponseDto
POST /api/v1/auth/2fa/verify — user — TwoFactorVerifyRequestDto → boolean
POST /api/v1/auth/2fa/disable — user — TwoFactorVerifyRequestDto → void
POST /api/v1/auth/2fa/regenerate-backup-codes — user — TwoFactorVerifyRequestDto → string[]
Badges (BadgeController)
GET /api/v1/badges — public → BadgeDto[]
GET /api/v1/users/me/badges — user → UserBadgeResponseDto[]
GET /api/v1/users/{id}/badges — public → UserBadgeResponseDto[]
Facilities (FacilityPublicController)
GET /api/v1/facilities — public → FacilityDto[]
Mosque discovery & admin (MosquePublicController, MosqueAdminAnalyticsController)
GET /api/v1/mosques/nearby?latitude=&longitude=&radiusKm=&facilities= — public → MosqueSummaryDto[]
GET /api/v1/mosques, GET /api/v1/mosques/, GET /api/v1/mosques/search?q=&city=&country=&page=&size= — public → PageResponse<MosqueSummaryDto>
GET /api/v1/mosques/{idOrSlug} — public → MosqueResponseDto
PUT /api/v1/mosques/{id} — MOSQUE_ADMIN|SUPER_ADMIN — MosqueUpdateRequestDto → MosqueResponseDto
GET /api/v1/mosque-admin/mosques/{id}/stats — MOSQUE_ADMIN|SUPER_ADMIN|MODERATOR → MosqueAdminStatsDto
Favorites (MosqueFavoriteController)
GET /api/v1/users/me/favorites?lat=&lon= — user → FavoriteMosqueResponseDto[]
POST /api/v1/users/me/favorites/{mosqueId}, POST /api/v1/mosques/{mosqueId}/favorite — user → FavoriteStatusDto
DELETE /api/v1/users/me/favorites/{mosqueId}, DELETE /api/v1/mosques/{mosqueId}/favorite — user → FavoriteStatusDto
GET /api/v1/users/me/favorites/{mosqueId}/status, GET /api/v1/mosques/{mosqueId}/is-favorite, GET /api/v1/mosques/{mosqueId}/favorite — user → FavoriteStatusDto
Crowdsourced submissions & claims (MosqueContributionController, MosqueClaimController, ModerationAdminController, MosqueClaimAdminController)
POST /api/v1/mosques/submissions — user — MosqueSubmissionRequestDto → MosqueSubmissionResponseDto (201)
POST /api/v1/mosques/{id}/suggest-edit — user — MosqueSubmissionRequestDto → MosqueSubmissionResponseDto (201)
POST /api/v1/mosques/{id}/claim — user — MosqueClaimSubmitDto → MosqueClaimResponseDto (201)
GET /api/v1/admin/moderation/submissions?status=&page=&size= — MODERATOR|SUPER_ADMIN → PageResponse<MosqueSubmissionResponseDto>
PATCH /api/v1/admin/moderation/submissions/{id}/decision — MODERATOR|SUPER_ADMIN — SubmissionDecisionDto → MosqueSubmissionResponseDto
GET /api/v1/admin/mosques/claims?status=&page=&size= — MODERATOR|SUPER_ADMIN → PageResponse<MosqueClaimResponseDto>
PATCH /api/v1/admin/mosques/claims/{id}/decision — MODERATOR|SUPER_ADMIN — MosqueClaimDecisionDto → MosqueClaimResponseDto
Platform analytics (PlatformAnalyticsAdminController)
GET /api/v1/admin/stats — MODERATOR|SUPER_ADMIN → PlatformStatsDto
Community: reviews, ratings, Q&A, flags (CommunityPublicController, CommunityUserController, CommunityAdminModerationController)
GET /api/v1/mosques/{idOrSlug}/reviews?page=&size= — public → PageResponse<ReviewResponseDto>
GET /api/v1/mosques/{idOrSlug}/ratings, GET /api/v1/mosques/{idOrSlug}/ratings-summary — public → RatingSummaryDto
GET /api/v1/mosques/{idOrSlug}/questions?page=&size= — public → PageResponse<QuestionResponseDto> (note path uses {idOrSlug} even though all_api_urls.txt shows {id} — accepts either UUID or slug)
POST /api/v1/mosques/{id}/reviews — user — ReviewCreateDto → ReviewResponseDto (201)
PUT /api/v1/mosques/{id}/reviews/{reviewId}, PUT /api/v1/community/reviews/{reviewId} — user — ReviewCreateDto → ReviewResponseDto
DELETE /api/v1/mosques/{id}/reviews/{reviewId}, DELETE /api/v1/community/reviews/{reviewId} — user → void
POST /api/v1/mosques/{id}/questions — user — QuestionCreateDto → QuestionResponseDto (201)
POST /api/v1/community/questions/{questionId}/answers — user — AnswerCreateDto → AnswerResponseDto (201)
PUT /api/v1/community/questions/{questionId} — user — QuestionCreateDto → QuestionResponseDto
DELETE /api/v1/community/questions/{questionId} — user → void
PUT /api/v1/community/answers/{answerId} — user — AnswerCreateDto → AnswerResponseDto
DELETE /api/v1/community/answers/{answerId} — user → void
POST /api/v1/community/flag — user — ContentFlagCreateDto → ContentFlagResponseDto (201)
GET /api/v1/admin/community/flags?page=&size= — MODERATOR|SUPER_ADMIN → PageResponse<ContentFlagResponseDto>
PATCH /api/v1/admin/community/flags/{id}/decision — MODERATOR|SUPER_ADMIN — FlagDecisionDto → ContentFlagResponseDto
Events & Khutbahs (EventPublicController, MosqueAdminEventController)
GET /api/v1/mosques/{idOrSlug}/events?type=&page=&size= — public → PageResponse<MosqueEventResponseDto>
GET /api/v1/events/{id} — public → MosqueEventResponseDto
GET /api/v1/mosques/{idOrSlug}/khutbahs — public → MosqueKhutbahResponseDto[] (not paginated, plain list)
POST /api/v1/mosque-admin/mosques/{id}/events — MOSQUE_ADMIN|SUPER_ADMIN — MosqueEventCreateDto → MosqueEventResponseDto (201)
PUT /api/v1/mosque-admin/mosques/{id}/events/{eventId} — MOSQUE_ADMIN|SUPER_ADMIN — MosqueEventCreateDto → MosqueEventResponseDto
DELETE /api/v1/mosque-admin/mosques/{id}/events/{eventId} — MOSQUE_ADMIN|SUPER_ADMIN → void
POST /api/v1/mosque-admin/mosques/{id}/khutbahs — MOSQUE_ADMIN|SUPER_ADMIN — MosqueKhutbahCreateDto → MosqueKhutbahResponseDto (201)
PUT /api/v1/mosque-admin/mosques/{id}/khutbahs/{khutbahId} — MOSQUE_ADMIN|SUPER_ADMIN — MosqueKhutbahCreateDto → MosqueKhutbahResponseDto
DELETE /api/v1/mosque-admin/mosques/{id}/khutbahs/{khutbahId} — MOSQUE_ADMIN|SUPER_ADMIN → void
Prayer times (PrayerTimesPublicController, MosqueAdminPrayerController)
GET /api/v1/mosques/{idOrSlug}/prayer-times?date=YYYY-MM-DD — public → PrayerTimesDayResponseDto
GET /api/v1/prayer-times/methods — public → CalculationMethodDto[]
GET /api/v1/mosque-admin/mosques/{id}/prayer-config — MOSQUE_ADMIN|SUPER_ADMIN → PrayerConfigDto
PUT /api/v1/mosque-admin/mosques/{id}/prayer-config — MOSQUE_ADMIN|SUPER_ADMIN — PrayerConfigUpdateDto → PrayerConfigDto
GET /api/v1/mosque-admin/mosques/{id}/iqamah-schedule — MOSQUE_ADMIN|SUPER_ADMIN → IqamahScheduleDto
PUT /api/v1/mosque-admin/mosques/{id}/iqamah-schedule — MOSQUE_ADMIN|SUPER_ADMIN — IqamahScheduleUpdateDto → IqamahScheduleDto
Media (MediaUploadController)
POST /api/v1/media/upload-url — user — UploadUrlRequestDto → UploadUrlResponseDto
PUT /api/v1/media/upload?key=, PUT /api/v1/media/mock-upload?key= — public — raw binary body → ApiResponse<string> (public URL)
POST /api/v1/media/upload-direct (multipart/form-data, fields file, category) — user → ApiResponse<string> (public URL) — undocumented in both OPEN_MOSQUE_DOCUMENTATION.md and all_api_urls.txt
Notifications (NotificationController) — all under /api/v1/users/me/notifications, all require login
GET ?page=&size= — user → PageResponse<NotificationResponseDto>
GET /unread-count — user → NotificationSummaryDto
PATCH /{id}/read — user → void
PATCH /read-all — user → int (count updated)
POST /devices — user — DeviceTokenRegisterDto → DeviceTokenResponseDto
DELETE /devices/{fcmToken} — user → void
GET /devices — user → DeviceTokenResponseDto[]
OSM Ingestion (OsmIngestionController) — all /api/v1/admin/ingest/osm, all MODERATOR|SUPER_ADMIN
POST /city — CityIngestRequestDto → IngestionSummaryDto
POST /radius — RadiusIngestRequestDto → IngestionSummaryDto
POST /bbox — BboxIngestRequestDto → IngestionSummaryDto

Total distinct handler methods found in the actual controllers: 76, spread across 24 @RestController classes (several methods respond to 2–3 path aliases, which is why the raw route count is higher). Add the 2 SpringDoc/actuator endpoints and there are effectively ~80 reachable HTTP routes — far more than the "48 endpoints" the documentation and all_api_urls.txt advertise (see §6 for the missing modules).

6. Notable implementation details for the frontend
Rate limiting (RateLimiterService + RateLimitingFilter)

Token-bucket algorithm, Redis-backed by default with an automatic local in-memory fallback if Redis errors (app.rate-limit.redis-failure-policy, default LOCAL_FALLBACK; also configurable to FAIL_OPEN/FAIL_CLOSED). Applies per request, keyed by IP (anonymous) or user UUID (authenticated):

Public/anonymous reads: 100 requests/min per IP
Authenticated requests (general): 120 requests/min per user
"Sensitive write" endpoints: 15 requests/min (keyed by user if logged in, else IP) — this bucket applies to POST/PATCH on: /api/v1/auth/2fa/**, /api/v1/auth/session, /api/v1/users/sync, /api/v1/media/**, /api/v1/mosques/submissions, /api/v1/mosques/*/suggest-edit, /api/v1/mosques/*/reviews, /api/v1/mosques/*/claim, /api/v1/community/flag, /api/v1/mosques/*/questions, /api/v1/community/questions/*/answers, /api/v1/users/me/notifications/devices.
Every response carries X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset headers (exposed via CORS, so JS can read them). A 429 also sets Retry-After (seconds) — build a global Axios/fetch interceptor around this rather than per-call handling.
/actuator/**, /swagger-ui/**, /v3/api-docs/**, /favicon.ico are exempt from rate limiting entirely.
CORS / environment config the frontend needs
Backend base URL (dev): http://localhost:8080. Frontend dev server assumed at http://localhost:5173 (Vite) — matches the observed frontend .env.
Firebase web SDK config the frontend needs to initialize client-side Firebase Auth (these are public identifiers, safe to embed in a frontend bundle — do not confuse with the backend's private Firebase Admin service-account key, which must never reach the frontend): apiKey, authDomain (<project>.firebaseapp.com), projectId, storageBucket, messagingSenderId, appId, and a VAPID key for Web Push (FCM) — the observed frontend .env names these VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_MESSAGING_SENDER_ID, VITE_FIREBASE_APP_ID, VITE_FIREBASE_VAPID_KEY.
Map tiles: the frontend .env points at a CARTO raster tile URL ({s}.basemaps.cartocdn.com/rastertiles/voyager/...), default map center ~Mecca (21.3891, 39.8579), default zoom 12 — useful defaults if building the map view from scratch.
The backend itself calls two external services server-side (frontend never talks to these directly): Aladhan API (https://api.aladhan.com/v1) for astronomical prayer time calculation, and OSM Overpass API (https://overpass-api.de/api/interpreter) for the admin ingestion feature.
Media / file uploads
Two upload paths exist: (1) the "pre-signed URL" flow (/media/upload-url → client PUTs the file to the returned uploadUrl) which is the documented/primary flow, and (2) a direct multipart endpoint /media/upload-direct that isn't mentioned in either doc file at all. In the dev profile there's no real cloud storage — DevLocalStorageService mocks it locally (files land under a local uploads/ dir served back at GET /api/v1/media/files/**, a public static resource handler configured in WebMvcConfig). Production apparently expects Cloudflare R2 (env vars CLOUDFLARE_R2_* were visible in the ops .env, though the Java code shown only referenced GCS/local — there may be a storage abstraction not fully covered by the files read; confirm the live StorageService implementation class in use in prod before hardcoding assumptions about the CDN URL shape).
Server-side file validation (FileSecurityValidator) checks magic bytes (not just the Content-Type header) against JPEG/PNG/GIF/PDF signatures, blocks executable signatures (PE/ELF/Mach-O/Java class files) and embedded <script> content, and sanitizes filenames (strips path traversal, restricts to [a-zA-Z0-9._-], requires an extension in {jpg, jpeg, png, webp, pdf}). Note: UploadUrlRequestDto.contentType pattern also allows image/heic, but FileSecurityValidator's allowed-extensions set does not include heic — a HEIC upload could pass the pre-signed-URL request step but fail the binary content validator; treat HEIC as unreliable end-to-end.
Points & badges — confirmed discrepancy with the docs
MosqueSubmission (new mosque) approval: +100 points — matches documentation.
Edit-suggestion (suggest-edit) approval: actual code awards +20 points (ModerationService.POINTS_FOR_EDIT_SUGGESTION = 20), but both OPEN_MOSQUE_DOCUMENTATION.md and all_api_urls.txt claim +50 points. This is a real discrepancy — build the frontend copy/UI text around the actual +20, not the documented +50, since the backend is what actually executes.
Mosque claim approval does not award points at all (docs don't claim it does either) — it awards the VERIFIED_IMAM badge and promotes the user's role to MOSQUE_ADMIN.
Badge evaluation is fire-and-forget from the relevant service call (favorites, points crediting) — there's no webhook/event the frontend can subscribe to beyond polling GET /users/me/badges or watching for a BADGE_EARNED push notification (see below).
Notifications / push (FCM)
In-app notifications are simple DB rows (UserNotification) surfaced via the /api/v1/users/me/notifications* REST endpoints (§5) — polling-based, no WebSocket/SSE.
Push notifications piggyback on the same trigger points (e.g., badge earned, submission approved/rejected, claim approved/rejected) and are sent via Firebase Cloud Messaging sendEachForMulticast to every registered device token for that user. If FirebaseApp isn't initialized (e.g., app.security.firebase.enabled=false or bad credentials), push sends are silently skipped (logged, not thrown) — in-app notification rows are still created regardless, so the notification bell will always work even if push doesn't.
Stale/invalid FCM tokens are auto-purged from user_devices after a failed multicast send — the frontend should re-register the device token on every app foreground/login rather than assuming a token persists forever.
metadataJson on NotificationResponseDto is a raw JSON string, not a parsed object — frontend must JSON.parse() it before use, and it may be null.
OSM ingestion specifics
Dedup logic (OsmIngestionService): a candidate OSM element is skipped as a duplicate if an existing mosque is within 50 meters, OR within 500 meters with a matching normalized name. duplicatesSkipped in IngestionSummaryDto reflects this.
dryRun: true on any of the 3 ingest endpoints parses and returns the summary without writing to the database — useful for a "preview before import" admin UI.
Facility auto-detection from OSM tags maps to the same 8 seeded facility codes listed in §3 (via extractFacilityCodes()/loadFacilityCatalog() in OsmIngestionService).
Other things worth knowing
Slugs: Mosque.slug is the human-readable identifier used interchangeably with UUID in {idOrSlug} path segments across mosque/event/prayer/review/question/khutbah endpoints — the frontend can route entirely on slug and never need to expose UUIDs in URLs, except for admin/mutation endpoints which take a bare {id} (UUID only, not slug-aware).
Soft deletes everywhere: BaseEntity.deleted (is_deleted) backs almost every domain entity (mosques, reviews, questions, answers, events, khutbahs, submissions, claims). Deleted rows are excluded from findBy... queries via repository method naming (...AndDeletedFalse patterns visible in MosqueRepository) — nothing for the frontend to do here, but it explains why a DELETE call returns 200 OK with no body rather than 204.
One review per user per mosque is enforced by a DB unique constraint (uq_mosque_reviews_user on mosque_id, user_id) — attempting a second POST .../reviews for the same mosque will 409; the frontend should check for an existing review first (there's no dedicated "my review for this mosque" endpoint — fetch the paginated review list and filter client-side, or rely on the 409 and redirect to the update form).
PageableDefault(size = 10) is used for reviews/questions/flags/events (Spring's native Pageable binding, params page/size/sort), while several other paginated admin endpoints (submissions, claims, users) use explicit @RequestParam(defaultValue=...) page/size ints built into a PageRequest manually — the query parameter names (page, size) are consistent either way, so this is only a backend implementation detail, not a frontend-facing inconsistency.
CalculationMethod ids 6 (Muslim World League v2?) is absent — the enum skips id 6 entirely (goes 5, 7, 8...), matching Aladhan's own numbering gaps; don't assume a contiguous 1..N id range if building a dropdown from aladhanMethodId.
Discrepancies between the documentation files and the real code (explicit list)
Endpoint count: docs claim 45–48 total endpoints; the real controllers expose ~76 distinct handler methods / ~80 reachable routes. Entire modules are undocumented in OPEN_MOSQUE_DOCUMENTATION.md/all_api_urls.txt: 2FA (6 endpoints), Badges (3), Favorites (4), Notifications & FCM devices (7), Mosque Admin Analytics stats (1), Platform Analytics stats (1), Auth session/logout cookie endpoints (2), Community answer/question update & delete (4 of the 10 CommunityUserController endpoints), /media/upload-direct (1), and PUT /api/v1/mosques/{id} (mosque update, 1). These are all real, working, @PreAuthorize-protected endpoints in the shipped code.
Edit-suggestion reward points: documented as +50, actual code awards +20 (ModerationService.POINTS_FOR_EDIT_SUGGESTION).
2FA route protection: SecurityConfig's URL matcher marks /api/v1/auth/** (and therefore /api/v1/auth/2fa/**) as permitAll(), but TwoFactorAuthController has class-level @PreAuthorize("isAuthenticated()") — method security wins, so these endpoints actually require auth despite what the URL-rule table would suggest to someone reading only SecurityConfig.
GET /api/v1/calculation-methods/** is whitelisted in SecurityConfig but no controller maps that path — the real, working route is GET /api/v1/prayer-times/methods. Dead config, not a working endpoint.
Refresh-token mechanism: om_refresh_token cookie exists and is set by /api/v1/auth/session, but there is no /refresh endpoint anywhere in the codebase that consumes it, and when the client doesn't supply a real refresh token the backend just stores <accessToken>-refresh as a placeholder. Treat the refresh cookie as non-functional today — the frontend must handle Firebase token refresh itself (via the Firebase JS SDK) and re-call /api/v1/auth/session to refresh the cookie's underlying access token.
POST /api/v1/users/sync sets om_access_token to the raw firebaseUid string, not an actual Firebase ID token — this cookie write looks unintentional/leftover and should not be relied on as establishing a working session; call /api/v1/auth/session explicitly after sync if cookie-based auth is desired.
Appendix: file locations referenced (on the Windows machine, D:\Open-Mosque\)
Envelope: src/main/java/com/openmosque/common/model/{ApiResponse,PageResponse,BaseEntity}.java
Exceptions: src/main/java/com/openmosque/common/exception/*.java
Security: src/main/java/com/openmosque/security/** (config/SecurityConfig.java, filter/FirebaseAuthFilter.java, service/{FirebaseTokenVerifier,TotpUtil}.java, ratelimit/**)
Config: src/main/resources/application*.yml, pom.xml
Controllers/DTOs/entities: src/main/java/com/openmosque/modules/{claim,community,event,ingestion,media,moderation,mosque,notification,prayer,user}/{controller,dto,entity,service}/*.java
Seed data: src/main/resources/db/migration/V2__init_mosques_and_facilities.sql (facilities), V11__init_favorites_and_badges.sql (badges, favorites schema)