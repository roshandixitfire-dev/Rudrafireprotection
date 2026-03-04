-- Add new columns to clients table
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS sales_person text,
ADD COLUMN IF NOT EXISTS client_reference text;
