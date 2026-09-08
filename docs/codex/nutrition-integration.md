# Nutrition and FatSecret integration

Last verified: 2026-09-06.

## Product boundary

Follow Your Aim owns personal nutrition targets, food/meal preferences, and the reviewed weekly plan. FatSecret remains the source of truth for actual diary entries and its food/serving identifiers. The first client iteration stores preferences and the draft plan in browser `localStorage`; it does not add a Firestore collection or change existing tracker history.

The React client never receives a FatSecret consumer secret, request-token secret, or access-token secret. A trusted backend is required for account connection and every delegated diary request.

## Why a backend is required

FatSecret account access uses [three-legged OAuth 1.0](https://platform.fatsecret.com/docs/guides/authentication/oauth1/three-legged). The request-token exchange and every delegated call are signed with HMAC-SHA1 using secrets which FatSecret requires the integrator to store securely. OAuth 2.0 supports signed application requests, but not delegated requests for a member diary; FatSecret documents this distinction in its [authentication guide](https://platform.fatsecret.com/docs/guides/authentication).

The current GitHub Pages deployment is static and cannot safely perform this work. Choose a small backend host (for example an existing private server or a serverless platform with encrypted environment variables) before enabling connection.

## Configuration needed from the owner

1. Create/sign in to a FatSecret Platform developer account and register Follow Your Aim.
2. Provide the backend environment with `FATSECRET_CONSUMER_KEY` and `FATSECRET_CONSUMER_SECRET`. Never paste either value into React source, a `REACT_APP_*` variable, Firestore, chat, or a commit.
3. Choose the backend public origin and register its exact OAuth callback, for example `https://api.example.com/nutrition/oauth/callback`.
4. Set the client build variable `REACT_APP_NUTRITION_API_BASE_URL` to that backend origin. This value is public and must not contain credentials.
5. Enter verified calorie and macro targets plus preferences in the Nutrition screen. Polish/localized food search is a premium localization feature according to FatSecret's [localization documentation](https://platform.fatsecret.com/docs/guides/localization).

## Client/backend contract

All client requests use JSON and `credentials: include`. The backend must restrict CORS to the Follow Your Aim origin, use secure `HttpOnly`/`SameSite` cookies or an equivalent personal authentication boundary, validate dates and numeric ranges, rate-limit writes, and keep an audit/idempotency record.

| Endpoint | Purpose | Response |
| --- | --- | --- |
| `GET /nutrition/status` | Safe connection state | `{ configured, connected, accountLabel? }` |
| `GET /nutrition/oauth/start` | Create request token and redirect to FatSecret | HTTP redirect |
| `GET /nutrition/oauth/callback` | Verify callback, exchange and store access token | Redirect to `/#/nutrition` |
| `GET /nutrition/diary?date=YYYY-MM-DD` | Read and aggregate the selected diary day | `{ date, calories, protein, fat, carbs, fiber?, entriesCount, syncedAt }` |
| `POST /nutrition/plans/publish` | Create only reviewed, unambiguous entries | `{ created, skipped }` |

FatSecret exposes read/create/edit/delete for diary entries in its [platform resources](https://platform.fatsecret.com/docs/guides). A planned meal name alone is not enough for a safe create call: each entry ultimately needs an exact `food_id`, `serving_id`, units, meal type, and date. The backend must skip ambiguous items and return them for user resolution; it must never silently select the first search result.

## Automatic end-of-day sync

The visible “Оновити сьогодні” button is supported by the client contract. A reliable end-of-day job cannot run in a closed browser; it belongs on the backend scheduler. Schedule it in the user's timezone, make diary reads idempotent, and store only the aggregate/history explicitly approved by the owner. Until that persistence decision is made, the scheduled job should remain disabled.

## Next implementation phase

- Deploy and authenticate the backend.
- Complete one real OAuth connection and read-only diary sync before enabling writes.
- Add food/serving matching with a preview and explicit confirmation for ambiguous matches.
- Decide whether approved aggregates and plans should sync between devices in a new Firestore collection; this requires a separately reviewed schema and deployed-rule check.
- Only then add scheduled sync and edit/delete controls.
