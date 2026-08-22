-- Migration: Remove isLunchBreak column from routines table
-- Reason: Lunch break logic has been removed from the application
-- Date: April 12, 2026

ALTER TABLE routines DROP COLUMN IF EXISTS is_lunch_break;
