-- Add recent_work column
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS recent_work text;
