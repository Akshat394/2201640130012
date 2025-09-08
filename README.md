# URL Shortener — 2201640130012

This is my full‑stack submission for the URL Shortener assignment. It includes an Express backend, a React (Vite) frontend, and a separate logging middleware. I aimed for a clean, readable codebase and a smooth local setup.

## Structure
- logging_middleware/
- backend/
- backend_test_submission/
- frontend_test_submission/
- README.md

## Run locally
Backend:
1. cd backend
2. cp .env.example .env
3. In .env set:
   - ACCESS_CODES=sAWTuR
   - USE_MEMORY_STORE=true
   - JWT_SECRET=any-strong-string
   - FRONTEND_ORIGIN=http://localhost:3000
4. npm install
5. npm run dev
Health: GET http://localhost:4000/

Frontend:
1. cd frontend_test_submission
2. npm install
3. npm run dev
UI: http://localhost:3000

## How to use
1) Register (Register tab). You’ll receive clientID and clientSecret once; the UI also downloads a text file. Save them.
2) Authenticate (Authenticate tab) with the same details and access code to get a JWT.
3) Shorten links (Shorten tab). You can add up to 5 at once, choose validity, and optionally set a custom shortcode.
4) Dashboard lists your links and lets you expand rows to see recent clicks with timestamp, referrer, user agent, and IP.

## API at a glance
- POST /auth/register → { clientID, clientSecret }
- POST /auth/token → { token, expiresIn }
- POST /shorturls → { shortLink, expiry }
- GET /shorturls/:shortcode → 302 redirect
- GET /shorturls/:shortcode/stats → { shortcode, redirects, expiry, clicks[] }
- GET /shorturls (auth) → { links: [...] }
Errors: { error, status }

## Logging
Custom middleware in logging_middleware/ writes JSON lines to logs/requests.log and logs/errors.log (gitignored). No request console logging.

## Notes
- Memory mode keeps setup simple. For persistence, set USE_MEMORY_STORE=false and configure MONGODB_URI.
- Shortcodes are unique and validated (alphanumeric, optional custom codes).
