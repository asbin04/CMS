-- ==============================================================================
-- Migration: V42__add_avatar_url_to_user_settings.sql
-- Description: Adds avatar_url column to public.user_settings for persisted
--              user profile pictures.
-- ==============================================================================

ALTER TABLE public.user_settings
    ADD COLUMN IF NOT EXISTS avatar_url TEXT;

