# RackRiot Tasks

## Support dual-role client and stylist accounts

**Priority:** Medium

**Required work**

- Detect when the authenticated user has both client and stylist profiles.
- Show a `Client / Stylist` mode switcher only for dual-role accounts.
- Route each mode to its corresponding dashboard and navigation.
- Remember the user's last-selected mode across sessions.
- Keep single-role accounts routed directly to their available dashboard.
- Add smoke tests for client-only, stylist-only, and dual-role logins.

## Configure local development to use development Supabase

**Status:** Completed

Local development now uses Supabase project `xpqcijnzvfibmxczbgex` through the
Git-ignored `.env.local`. The publishable key was validated against the Auth
settings endpoint.

Production credentials remain separate in Vercel.

## Require and test email confirmation

**Priority:** High, before public signup launch

**Current issue**

Development currently has `mailer_autoconfirm` enabled. New accounts are
confirmed immediately, so Supabase does not send a confirmation email.

**Required work**

- Require email confirmation in both development and production Supabase Auth.
- Keep the confirmation subject as `Confirm your RackRiot account`.
- Confirm Site URL and allowed redirect URLs for local, preview, and production.
- After Resend SMTP is configured, run client and stylist signup smoke tests.
- Verify unconfirmed users cannot log in before clicking the confirmation link.
- Verify the confirmation link returns users to the correct RackRiot URL.
- Remove all smoke-test users and related rows after verification.

## Configure Resend for Supabase authentication email

**Priority:** High, before public signup launch

**Required work**

- Create or sign in to the RackRiot Resend account.
- Add and verify the sending domain `updates.rackriot.app`.
- Restore access to the Squarespace account that manages `rackriot.app`.
- Add the DNS records supplied by Resend in Squarespace:
  - DKIM `TXT` record at `resend._domainkey.updates`
  - Sending `MX` record at `send.updates` with priority `10`
  - SPF `TXT` record at `send.updates`
  - Copy the complete record values from Resend; do not use truncated values
    from screenshots.
- Use `RackRiot <auth@updates.rackriot.app>` as the Auth sender.
- Create separate Resend API keys for development and production.
- Configure custom SMTP in both Supabase projects:
  - Host: `smtp.resend.com`
  - Port: `465`
  - Username: `resend`
  - Password: environment-specific Resend API key
- Keep Resend API keys out of Git and local documentation.
- Review Supabase Auth email templates and redirect URLs for:
  - Client email confirmation
  - Stylist email confirmation
  - Password reset

**Acceptance criteria**

- Client confirmation email is delivered to a real inbox.
- Stylist confirmation email is delivered to a real inbox.
- Password-reset email is delivered and opens `/reset-password`.
- Sender authentication passes SPF and DKIM checks.
- Delivery is visible in Resend logs.
- Development and production use separate API keys.

**Temporary limitation**

- Supabase's default sender is limited and not production-ready.
- Do not launch public email/password signup until custom SMTP is verified.

**Blocked by**

- Squarespace currently opens the login screen and account access is not
  available.
- Resend cannot verify `updates.rackriot.app` until the DNS records are added.
