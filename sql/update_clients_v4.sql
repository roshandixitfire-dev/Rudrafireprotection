-- Ensure AMC dates exist
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS amc_start_date date,
ADD COLUMN IF NOT EXISTS amc_end_date date;

-- Add Building Info
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS floor_height text,
ADD COLUMN IF NOT EXISTS podium text,
ADD COLUMN IF NOT EXISTS ground text,
ADD COLUMN IF NOT EXISTS system_type text;
