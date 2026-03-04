-- Add extinguisher refill dates and scheduled service tracking
-- Wrap rename in a DO block for idempotency
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='fire_extinguisher_clean_agent') AND 
       NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='fire_extinguisher_clean_agent_qty') THEN
        ALTER TABLE public.clients RENAME COLUMN fire_extinguisher_clean_agent TO fire_extinguisher_clean_agent_qty;
    END IF;
END $$;

-- Add new refill date columns
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS extinguisher_refill_last date,
ADD COLUMN IF NOT EXISTS extinguisher_refill_next date,
-- Add JSONB column for scheduled service dates
ADD COLUMN IF NOT EXISTS scheduled_service_dates jsonb DEFAULT '[]'::jsonb;
