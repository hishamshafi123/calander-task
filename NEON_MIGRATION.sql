-- Migration to add 'type' field to categories table
-- Run this SQL in your Neon database console

-- Add the 'type' column with default value 'life'
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'life';

-- Update the constraint to check valid values (optional but recommended)
-- ALTER TABLE categories
-- ADD CONSTRAINT categories_type_check
-- CHECK (type IN ('life', 'business'));

-- Verify the migration
SELECT id, name, type FROM categories LIMIT 5;
