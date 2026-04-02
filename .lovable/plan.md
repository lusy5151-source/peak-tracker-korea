

## Plan: Replace hardcoded URLs with wandeung.com

### Findings

Only one file contains `peak-tracker-korea.lovable.app`: **`src/pages/AuthPage.tsx`**. The same file also uses `window.location.origin` for Google OAuth redirect. No other files reference the old domain.

### Changes

**File: `src/pages/AuthPage.tsx`**

1. **Line 57** — Change `emailRedirectTo` in `signUp()`:
   - From: `"https://peak-tracker-korea.lovable.app"`
   - To: `"https://wandeung.com"`

2. **Line 99** — Change `redirectTo` in Google OAuth:
   - From: `window.location.origin`
   - To: `"https://wandeung.com"`

### Note on Supabase redirect URL allowlist

The redirect URL allowlist (`https://wandeung.com` and `https://wandeung.com/**`) must be configured in the backend auth settings. This is a dashboard-level setting, not a client code change. I will configure this using the auth configuration tool after implementing the code changes.

### No other files affected

- `src/integrations/supabase/client.ts` — auto-generated, uses env vars, no hardcoded URLs
- `supabase/functions/kakao-auth/index.ts` — uses dynamic `redirect_uri` from request body
- All other files — no references found

