# <2201640130012> — URL Shortener Application

Author: 2201640130012

## Project structure
- logging_middleware/
- backend/
- backend_test_submission/
- frontend_test_submission/
- README.md

## Running backend (dev)
1. cd backend
2. cp .env.example .env and populate values (MONGODB_URI, JWT_SECRET, ACCESS_CODES, BASE_URL, LOG_DIR)
3. npm install
4. npm run dev

## Endpoints
### Registration
POST /auth/register
Body:
{
  "email":"ram@college.edu",
  "name":"Ram Krishna",
  "mobileNo":"9999999999",
  "githubUsername":"github",
  "rollNo":"a4ibb",
  "accessCode":"<provided-by-admin>"
}
Response: { clientID, clientSecret } // clientSecret shown only once

### Token
POST /auth/token
Body: { email, name, rollNo, accessCode, clientID, clientSecret }
Response: { token, expiresIn }

### Create short link
POST /shorturls
Body: { url, validity (minutes), shortcode (optional) }
Response: { shortLink, expiry }

### Redirect
GET /shorturls/:shortcode
-> redirects to original URL

### Stats
GET /shorturls/:shortcode/stats
Response: { shortcode, redirects, expiry }

## Logging
- Logging middleware is in `logging_middleware/`
- Logs written to `logging_middleware/logs/requests.log` and `errors.log`
- Do not commit logs

## Notes
- Save `clientSecret` securely (only returned once).
- All commit messages contain author name.