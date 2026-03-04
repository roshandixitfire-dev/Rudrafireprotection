-- Add service_plan to clients
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS service_plan text,
ADD COLUMN IF NOT EXISTS amc_start_date date,
ADD COLUMN IF NOT EXISTS amc_end_date date;

-- Add reminders to client_activities
ALTER TABLE public.client_activities
ADD COLUMN IF NOT EXISTS next_reminder_date date,
ADD COLUMN IF NOT EXISTS reminder_status text DEFAULT 'Pending',
ADD COLUMN IF NOT EXISTS reminder_type text;
