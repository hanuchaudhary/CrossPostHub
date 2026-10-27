---
name: x
description: Use when building integrations with X (formerly Twitter), accessing
  posts and user data, implementing real-time streaming, managing
  authentication, or working with X's REST API endpoints for posts, users,
  lists, direct messages, spaces, and trends.
metadata:
  mintlify-proj: x
  version: "1.0"
---

# X API Skill

## Product summary

The X API provides programmatic access to X's public conversation through modern REST endpoints. Agents use it to read posts, publish content, manage users, search archives, stream real-time data, and analyze trends. The API uses pay-per-usage pricing with no commitments. Key files: Bearer Token (app-only auth), OAuth credentials (user context), and API keys stored in the Developer Console at console.x.com. Primary endpoints: `https://api.x.com/2/` for posts, users, spaces, lists, direct messages, and trends. Official SDKs: Python XDK and TypeScript XDK handle authentication, pagination, and rate limiting automatically. Full documentation: https://docs.x.com

---

## When to use

Reach for this skill when:

- **Building integrations**: Connect X data to dashboards, databases, or third-party tools
- **Searching posts**: Query recent posts (last 7 days) or full archive (pay-per-use/Enterprise only)
- **Streaming real-time data**: Set up filtered stream rules to receive posts matching criteria as they're published
- **Managing user data**: Look up users, manage follows, blocks, mutes, or bookmarks
- **Publishing content**: Create, edit, or delete posts programmatically
- **Accessing analytics**: Retrieve engagement metrics, impressions, and post performance
- **Working with lists, spaces, or DMs**: Manage curated lists, find live audio conversations, or send private messages
- **Handling authentication**: Implement OAuth 1.0a (user context), OAuth 2.0 (authorization code or app-only), or Bearer tokens
- **Paginating results**: Retrieve large datasets across multiple pages using next_token cursors
- **Troubleshooting API errors**: Debug 401 (auth), 403 (permissions), 429 (rate limits), or 400 (bad request) responses

---

## Quick reference

### Authentication methods

| Method | Use case | Credentials |
|--------|----------|-------------|
| **Bearer Token (App-only)** | Public data, no user context | API Key + Secret → Bearer Token |
| **OAuth 1.0a User Context** | Act on behalf of authenticated user | API Key + Secret + User Access Token + Secret |
| **OAuth 2.0 Authorization Code** | Web apps with user login flow | Client ID + Secret + authorization code |
| **OAuth 2.0 App-only** | Server-side apps, public data | Client ID + Secret |

**Get credentials**: Developer Console (console.x.com) → Your App → Keys and Tokens

### Core endpoints

| Resource | Method | Endpoint | Purpose |
|----------|--------|----------|---------|
| User lookup | GET | `/2/users/by/username/{username}` | Get user by handle |
| Post lookup | GET | `/2/tweets/{id}` | Get post by ID |
| Recent search | GET | `/2/tweets/search/recent` | Search last 7 days |
| Full archive search | GET | `/2/tweets/search/all` | Search all posts (pay-per-use) |
| Filtered stream | GET | `/2/tweets/search/stream` | Real-time post stream |
| Stream rules | POST/GET | `/2/tweets/search/stream/rules` | Manage stream filters |
| User posts | GET | `/2/users/{id}/tweets` | Get user's posts |
| Post creation | POST | `/2/tweets` | Create a post |
| Direct messages | POST/GET | `/2/dm_conversations` | Send/receive DMs |

### Query parameters

| Parameter | Purpose | Example |
|-----------|---------|---------|
| `tweet.fields` | Request post fields | `created_at,public_metrics,lang` |
| `user.fields` | Request user fields | `created_at,description,public_metrics` |
| `expansions` | Include related objects | `author_id,attachments.media_keys` |
| `max_results` | Results per page | `100` |
| `pagination_token` | Cursor for next page | `7140w9gefhslx3` |
| `query` | Search terms (search endpoints) | `from:xdevelopers lang:en` |

### Common field combinations

**Post analytics**: `tweet.fields=created_at,public_metrics,possibly_sensitive`

**User profiles**: `user.fields=created_at,description,location,public_metrics,verified`

**Full post context**: `tweet.fields=created_at,author_id,conversation_id&expansions=author_id&user.fields=username,name`

**Media details**: `tweet.fields=attachments&expansions=attachments.media_keys&media.fields=url,preview_image_url,alt_text`

### Rate limit headers

Every response includes:

| Header | Meaning |
|--------|---------|
| `x-rate-limit-limit` | Max requests in 15-minute window |
| `x-rate-limit-remaining` | Requests left in current window |
| `x-rate-limit-reset` | Unix timestamp when window resets |

---

## Decision guidance

### When to use search vs. stream

| Scenario | Use search | Use stream |
|----------|-----------|-----------|
| Historical data analysis | ✓ | |
| Real-time monitoring | | ✓ |
| One-time data pull | ✓ | |
| Continuous data collection | | ✓ |
| Last 7 days only | ✓ (recent) | ✓ |
| Full archive (2006+) | ✓ (all, pay-per-use) | |
| Complex queries | ✓ | ✓ |

### When to use fields vs. expansions

| Need | Use fields | Use expansions |
|------|-----------|-----------------|
| Get data on primary object | ✓ | |
| Get data on related objects | | ✓ |
| Request author details with post | | ✓ (expansions=author_id) + user.fields |
| Get post metrics | ✓ (tweet.fields=public_metrics) | |
| Minimize response size | ✓ (request only needed fields) | |

### When to use SDKs vs. raw HTTP

| Approach | Use SDKs | Use raw HTTP |
|----------|----------|-------------|
| Production code | ✓ | |
| Quick testing | | ✓ (cURL) |
| Automatic pagination | ✓ | |
| Manual control | | ✓ |
| Type safety (TypeScript) | ✓ | |
| Language flexibility | | ✓ |

---

## Workflow

### 1. Set up authentication

1. Go to [console.x.com](https://console.x.com) and sign in with X account
2. Create a new app (or use existing)
3. Navigate to **Keys and Tokens** tab
4. Generate credentials:
   - For app-only: Copy **Bearer Token**
   - For user context: Generate **Access Token & Secret** (OAuth 1.0a)
   - For OAuth 2.0: Copy **Client ID & Secret**
5. Store credentials securely (environment variables, secrets manager)

### 2. Make your first request

1. Choose an endpoint (e.g., user lookup, post search)
2. Construct URL with required parameters
3. Add `Authorization` header:
   - Bearer Token: `Authorization: Bearer YOUR_TOKEN`
   - OAuth 1.0a: Sign request with API Key, Secret, Access Token, Secret
4. Send GET/POST request
5. Parse JSON response—data is in `data` field, pagination info in `meta`

### 3. Request additional fields

1. Identify what data you need (e.g., post creation time, author info)
2. Add field parameters: `?tweet.fields=created_at,public_metrics`
3. For related objects, add expansions: `&expansions=author_id&user.fields=username`
4. Resend request and check response

### 4. Handle pagination

1. Check response `meta.next_token`
2. If present, make next request with `?pagination_token=<next_token>`
3. Repeat until no `next_token` returned
4. Use SDKs for automatic pagination handling

### 5. Set up streaming (if needed)

1. Create stream rules: `POST /2/tweets/search/stream/rules` with rule value (e.g., `from:xdevelopers`)
2. Connect to stream: `GET /2/tweets/search/stream`
3. Keep connection open; receive posts matching rules in real-time
4. Implement reconnection logic for disconnects

### 6. Verify and monitor

1. Check response status codes (200 = success, 4xx = client error, 5xx = server error)
2. Monitor rate limit headers to avoid hitting limits
3. Log errors with full response body for debugging
4. Track API usage in Developer Console

---

## Common gotchas

- **Missing Bearer Token**: Requests fail with 401. Verify token is copied exactly and hasn't been regenerated.
- **Insufficient permissions**: 403 error means app lacks permission for endpoint. Check app permissions in Developer Console.
- **Rate limit exceeded**: 429 error. Implement exponential backoff (start 1 min, double each retry). Check `x-rate-limit-reset` header.
- **Forgetting fields parameter**: Endpoints return minimal data by default (only `id`, `text`, `edit_history_tweet_ids` for posts). Always add `tweet.fields` or `user.fields` for additional data.
- **Expansions without fields**: Adding `expansions=author_id` includes author object but only with default fields. Combine with `user.fields` to get author details.
- **Pagination token expiry**: Tokens may expire after time. Don't store pagination tokens long-term; regenerate from fresh request.
- **Search limited to 7 days**: Recent search endpoint only returns posts from last 7 days. Use full-archive search (pay-per-use) for older data.
- **Stream rules not matching**: Rules are case-sensitive and use specific operators. Test with simple rules first (e.g., `from:username`).
- **Callback URL mismatch**: OAuth flows fail if callback URL doesn't match exactly (including protocol, domain, path, trailing slash). Register exact URL in Developer Console.
- **Forgetting to URL-encode query**: Search queries with special characters must be URL-encoded. Use `%20` for spaces, `%23` for `#`.
- **Deprecated v1.1 endpoints**: Don't use old Twitter API v1.1 endpoints. Use v2 endpoints only.
- **Character counting**: X counts characters differently (URLs, emoji, etc.). Use `/2/tweets/counts` endpoint or check `counting-characters` documentation.

---

## Verification checklist

Before submitting work with X API:

- [ ] Authentication credentials are valid and stored securely (not hardcoded)
- [ ] Correct authentication method used for endpoint (app-only vs. user context)
- [ ] All required query parameters included (e.g., `query` for search, `max_results` for pagination)
- [ ] Field parameters added for needed data (`tweet.fields`, `user.fields`, etc.)
- [ ] Expansions included for related objects if needed
- [ ] Response status code is 200 (or expected success code)
- [ ] Response data is in `data` field, not at root level
- [ ] Pagination handled correctly (loop until no `next_token`)
- [ ] Rate limit headers checked; backoff implemented if needed
- [ ] Error responses logged with full body for debugging
- [ ] Callback URLs registered in Developer Console (for OAuth flows)
- [ ] Bearer Token or credentials not exposed in logs or version control
- [ ] Code uses official SDK if available (Python or TypeScript)

---

## Resources

**Comprehensive page listing**: https://docs.x.com/llms.txt

**Critical documentation pages**:
- [X API Introduction](/x-api/introduction) — Overview of endpoints and capabilities
- [Make Your First Request](/make-your-first-request) — Step-by-step quickstart with cURL examples
- [Authentication Overview](/fundamentals/authentication/overview) — All auth methods explained

---

> For additional documentation and navigation, see: https://docs.x.com/llms.txt