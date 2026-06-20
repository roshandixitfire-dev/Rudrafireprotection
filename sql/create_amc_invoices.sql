-- Create the amc_invoices table in the public schema
CREATE TABLE IF NOT EXISTS public.amc_invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    invoice_type VARCHAR(50) NOT NULL DEFAULT 'tax',
    invoice_date DATE NOT NULL,
    to_title VARCHAR(255),
    company_name VARCHAR(255) NOT NULL,
    street VARCHAR(255),
    location VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    pin VARCHAR(20),
    contact_person VARCHAR(255),
    contact_number VARCHAR(50),
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    packages JSONB NOT NULL DEFAULT '[]'::jsonb,
    terms JSONB NOT NULL DEFAULT '[]'::jsonb,
    grand_total NUMERIC(15, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Turn on row level security
ALTER TABLE public.amc_invoices ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to manage amc_invoices
CREATE POLICY "Enable all operations for authenticated users on amc_invoices" 
    ON public.amc_invoices 
    FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

-- Allow public read access to amc_invoices (optional, depends on your auth strategy)
-- CREATE POLICY "Enable read access for all users on amc_invoices" 
--     ON public.amc_invoices 
--     FOR SELECT 
--     USING (true);
