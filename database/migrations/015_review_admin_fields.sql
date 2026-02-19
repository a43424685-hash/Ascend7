-- Migration 015: Add admin-writable fields to reviews table
-- Allows admin to create reviews with custom author name and body info

ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS admin_author_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS height SMALLINT,
  ADD COLUMN IF NOT EXISTS weight SMALLINT,
  ADD COLUMN IF NOT EXISTS body_type VARCHAR(50);
