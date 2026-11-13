-- ==============================================================================
-- Migration: V44__disable_non_admin_users.sql
-- Description: Disables any app_users row that is not role ADMIN or not in the
--              three allowlisted admin emails, and deletes their pending OTPs.
-- ==============================================================================

DELETE FROM public.password_reset_otps
WHERE used_at IS NULL
  AND user_id IN (
      SELECT id
      FROM public.app_users
      WHERE upper(trim(role)) <> 'ADMIN'
         OR lower(trim(email)) NOT IN (
             'asbin.t.s@kalpanaaa.in',
             'founder@kalpanaaasoftwaresolutions.in',
             'akshit.ujjain@kalpanaaasoftwaresolutions.in'
         )
  );

UPDATE public.app_users
SET status = 'DISABLED',
    updated_at = CURRENT_TIMESTAMP
WHERE status <> 'DISABLED'
  AND (
      upper(trim(role)) <> 'ADMIN'
      OR lower(trim(email)) NOT IN (
          'asbin.t.s@kalpanaaa.in',
          'founder@kalpanaaasoftwaresolutions.in',
          'akshit.ujjain@kalpanaaasoftwaresolutions.in'
      )
  );

