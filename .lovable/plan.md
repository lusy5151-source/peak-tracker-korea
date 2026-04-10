

## Analysis: Current Auth Configuration

### Current State
The code is **already correctly structured**:
- **AuthPage.tsx**: Email/password uses `supabase.auth.signUp` and `supabase.auth.signInWithPassword` directly (lines 80, 97)
- **AuthPage.tsx**: Google login uses `lovable.auth.signInWithOAuth("google")` (line 138)
- **AuthContext.tsx**: Session management uses `supabase.auth.onAuthStateChange` and `supabase.auth.getSession`

### Root Cause of "auth.users not populated"
The Lovable **preview environment** intercepts and blocks direct `supabase.auth.signUp` and `supabase.auth.signInWithPassword` requests. This is a known limitation — email/password auth only works on the **published URL** (wandeung.com), not in the editor preview.

### What Actually Needs Fixing
The code structure is correct but has some issues worth cleaning up:

1. **Remove debug console.logs** from AuthContext.tsx (lines 42, 52, 60) and AuthPage.tsx (lines 96, 104-105)
2. **Duplicate profile sync logic** — profiles are upserted in 3 places (AuthContext onAuthStateChange, AuthContext getSession, and AuthPage handleSubmit). Consolidate to just AuthContext
3. **signOut robustness** — current implementation is already good with `scope: 'local'`

### Plan

**Step 1: Clean up AuthContext.tsx**
- Remove debug `console.log` statements
- Keep the existing dual-path profile sync (onAuthStateChange + getSession)

**Step 2: Clean up AuthPage.tsx**  
- Remove debug `console.log` statements (lines 96, 104-105)
- Remove redundant `profiles.upsert` calls from handleSubmit and handleGoogleLogin — AuthContext already handles this on SIGNED_IN/TOKEN_REFRESHED events
- Keep all email/password calls as `supabase.auth.*` (already correct)
- Keep Google login as `lovable.auth.signInWithOAuth("google")` (already correct)

**Step 3: No structural changes needed**
- The auth architecture is already correct per Lovable docs
- Email/password → `supabase.auth` 
- Google OAuth → `lovable.auth`
- Testing must be done on wandeung.com, not in the preview editor

### Technical Note
To verify email/password signup works, you must test on **https://wandeung.com** — it will not work in the Lovable editor preview due to proxy restrictions.

