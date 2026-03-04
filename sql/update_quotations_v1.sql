-- Alter the quotations table to add new fields
ALTER TABLE public.quotations
ADD COLUMN IF NOT EXISTS quote_name TEXT,
ADD COLUMN IF NOT EXISTS quote_code TEXT,
ADD COLUMN IF NOT EXISTS account TEXT,
ADD COLUMN IF NOT EXISTS deal TEXT,
ADD COLUMN IF NOT EXISTS quote_type TEXT,
ADD COLUMN IF NOT EXISTS door_type TEXT;

-- Update the quotation_status Enum with new values
ALTER TYPE quotation_status ADD VALUE IF NOT EXISTS 'Needs Approval';
ALTER TYPE quotation_status ADD VALUE IF NOT EXISTS 'Requirement Change';
ALTER TYPE quotation_status ADD VALUE IF NOT EXISTS 'Submit';
ALTER TYPE quotation_status ADD VALUE IF NOT EXISTS 'Approved';
