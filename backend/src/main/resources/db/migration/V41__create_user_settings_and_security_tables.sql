-- ==============================================================================
-- Migration: V41__create_user_settings_and_security_tables.sql
-- Description: Creates user_settings, user_sessions, and user_login_history
--              tables for dynamic profile, security, notification, and theme
--              preferences backed by PostgreSQL.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.user_settings (
    id BIGSERIAL PRIMARY KEY,
    user_key VARCHAR(150) NOT NULL,
    user_id UUID REFERENCES public.app_users(id) ON DELETE SET NULL,
    display_name VARCHAR(100) NOT NULL,
    role_label VARCHAR(50) NOT NULL DEFAULT 'ADMIN',
    department VARCHAR(100),
    employee_id VARCHAR(50),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    job_title VARCHAR(100),
    mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    mfa_method VARCHAR(50) NOT NULL DEFAULT 'Authenticator App',
    mfa_updated_at TIMESTAMPTZ,
    email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    in_app_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    task_approval_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    marketing_updates BOOLEAN NOT NULL DEFAULT FALSE,
    theme VARCHAR(20) NOT NULL DEFAULT 'light',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_settings_user_key UNIQUE (user_key),
    CONSTRAINT chk_user_settings_theme CHECK (theme IN ('light', 'dark', 'system'))
);

CREATE INDEX IF NOT EXISTS idx_user_settings_user_key ON public.user_settings (user_key);
CREATE INDEX IF NOT EXISTS idx_user_settings_email ON public.user_settings (email);

CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_key VARCHAR(150) NOT NULL,
    token_fingerprint VARCHAR(128),
    device_name VARCHAR(150) NOT NULL,
    browser VARCHAR(100) NOT NULL,
    ip_address VARCHAR(64) NOT NULL,
    location VARCHAR(150),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_key ON public.user_sessions (user_key, active, last_active_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_fingerprint ON public.user_sessions (token_fingerprint);

CREATE TABLE IF NOT EXISTS public.user_login_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_key VARCHAR(150) NOT NULL,
    event_type VARCHAR(60) NOT NULL,
    status VARCHAR(30) NOT NULL,
    device_name VARCHAR(150),
    browser VARCHAR(100),
    ip_address VARCHAR(64),
    details VARCHAR(255),
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_login_history_user_time ON public.user_login_history (user_key, occurred_at DESC);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_login_history ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.user_settings FROM anon, authenticated;
REVOKE ALL ON TABLE public.user_sessions FROM anon, authenticated;
REVOKE ALL ON TABLE public.user_login_history FROM anon, authenticated;

