-- ==============================================================================
-- Migration: V24__seed_authorized_admin_users.sql
-- Description: Seeds and guarantees the three authorized admin accounts in
--              app_users table for Kalpanaaa Software Solutions with BCrypt hashes.
-- ==============================================================================

-- 1. Ensure the three authorized admin accounts exist with role 'ADMIN' and status 'ACTIVE'
INSERT INTO public.app_users (
    username,
    email,
    password_hash,
    display_name,
    role,
    status,
    password_changed_at,
    created_at,
    updated_at
) VALUES 
(
    'asbin.t.s@kalpanaaa.in',
    'asbin.t.s@kalpanaaa.in',
    '$2a$10$k5Jvdlu.U2F33o8hA1262.OwfcoEFZYjfHOgjTEbdZT9wADZxq6ZO',
    'Asbin T S',
    'ADMIN',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'founder@kalpanaaasoftwaresolutions.in',
    'founder@kalpanaaasoftwaresolutions.in',
    '$2a$10$k5Jvdlu.U2F33o8hA1262.OwfcoEFZYjfHOgjTEbdZT9wADZxq6ZO',
    'Gaurav Kumar Tripathi',
    'ADMIN',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'akshit.ujjain@kalpanaaasoftwaresolutions.in',
    'akshit.ujjain@kalpanaaasoftwaresolutions.in',
    '$2a$10$k5Jvdlu.U2F33o8hA1262.OwfcoEFZYjfHOgjTEbdZT9wADZxq6ZO',
    'Akshit Ujjain',
    'ADMIN',
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO UPDATE SET
    username = EXCLUDED.username,
    password_hash = EXCLUDED.password_hash,
    display_name = EXCLUDED.display_name,
    role = 'ADMIN',
    status = 'ACTIVE',
    password_changed_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP;

-- 2. Revoke admin access from any unauthorized legacy accounts
UPDATE public.app_users
SET status = 'DISABLED'
WHERE email NOT IN (
    'asbin.t.s@kalpanaaa.in',
    'founder@kalpanaaasoftwaresolutions.in',
    'akshit.ujjain@kalpanaaasoftwaresolutions.in'
);

