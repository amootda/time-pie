-- Migration: Add event type system (anchor/hard/soft) columns
-- Date: 2026-02-14
-- Description: Adds event_type, purpose, and type-specific columns to events table
-- This migration is idempotent and can be run multiple times safely

-- Add new columns if they don't exist
DO $$
BEGIN
  -- Add event_type column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'event_type'
  ) THEN
    ALTER TABLE events ADD COLUMN event_type TEXT DEFAULT 'hard';
    RAISE NOTICE 'Added event_type column';
  END IF;

  -- Add color column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'color'
  ) THEN
    ALTER TABLE events ADD COLUMN color TEXT DEFAULT '#4A90D9';
    RAISE NOTICE 'Added color column';
  END IF;

  -- Add purpose column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'purpose'
  ) THEN
    ALTER TABLE events ADD COLUMN purpose TEXT;
    RAISE NOTICE 'Added purpose column';
  END IF;

  -- Add base_time column (anchor type)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'base_time'
  ) THEN
    ALTER TABLE events ADD COLUMN base_time TEXT;
    RAISE NOTICE 'Added base_time column';
  END IF;

  -- Add target_duration_min column (anchor type)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'target_duration_min'
  ) THEN
    ALTER TABLE events ADD COLUMN target_duration_min INTEGER;
    RAISE NOTICE 'Added target_duration_min column';
  END IF;

  -- Add buffer_min column (anchor type)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'buffer_min'
  ) THEN
    ALTER TABLE events ADD COLUMN buffer_min INTEGER;
    RAISE NOTICE 'Added buffer_min column';
  END IF;

  -- Add repeat_days column (hard type)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'repeat_days'
  ) THEN
    ALTER TABLE events ADD COLUMN repeat_days INTEGER[];
    RAISE NOTICE 'Added repeat_days column';
  END IF;

  -- Add is_locked column (hard type)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'is_locked'
  ) THEN
    ALTER TABLE events ADD COLUMN is_locked BOOLEAN DEFAULT false;
    RAISE NOTICE 'Added is_locked column';
  END IF;

  -- Add location column (hard type)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'location'
  ) THEN
    ALTER TABLE events ADD COLUMN location TEXT;
    RAISE NOTICE 'Added location column';
  END IF;

  -- Add weekly_goal column (soft type)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'weekly_goal'
  ) THEN
    ALTER TABLE events ADD COLUMN weekly_goal INTEGER;
    RAISE NOTICE 'Added weekly_goal column';
  END IF;

  -- Add preferred_window column (soft type)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'preferred_window'
  ) THEN
    ALTER TABLE events ADD COLUMN preferred_window TEXT;
    RAISE NOTICE 'Added preferred_window column';
  END IF;

  -- Add priority column (soft type)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'priority'
  ) THEN
    ALTER TABLE events ADD COLUMN priority INTEGER;
    RAISE NOTICE 'Added priority column';
  END IF;
END $$;

-- Add constraints if they don't exist
DO $$
BEGIN
  -- event_type constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'events_event_type_check'
  ) THEN
    ALTER TABLE events ADD CONSTRAINT events_event_type_check
      CHECK (event_type IN ('anchor', 'hard', 'soft'));
    RAISE NOTICE 'Added events_event_type_check constraint';
  END IF;

  -- preferred_window constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'events_preferred_window_check'
  ) THEN
    ALTER TABLE events ADD CONSTRAINT events_preferred_window_check
      CHECK (preferred_window IN ('morning', 'afternoon', 'evening', 'night'));
    RAISE NOTICE 'Added events_preferred_window_check constraint';
  END IF;
END $$;

-- Backfill color for existing rows
UPDATE events SET color = '#4A90D9' WHERE color IS NULL;

-- Migration completed successfully
DO $$
BEGIN
  RAISE NOTICE 'Migration completed: Event type system columns added';
END $$;
