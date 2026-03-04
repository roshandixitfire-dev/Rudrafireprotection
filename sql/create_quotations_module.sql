-- Create the Sales Quotations module tables

-- 1. Create ENUM for quotation status
DO $$ BEGIN
    CREATE TYPE quotation_status AS ENUM ('Draft', 'Sent', 'Accepted', 'Rejected', 'Expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Quotations master table
CREATE TABLE IF NOT EXISTS public.quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_number TEXT UNIQUE NOT NULL,
    client_id BIGINT REFERENCES public.clients(id) ON DELETE RESTRICT,
    
    quotation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiration_date DATE,
    payment_terms TEXT,
    
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    tax_total DECIMAL(12,2) NOT NULL DEFAULT 0,
    grand_total DECIMAL(12,2) NOT NULL DEFAULT 0,
    
    status quotation_status DEFAULT 'Draft',
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Quotation line items table
CREATE TABLE IF NOT EXISTS public.quotation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_id UUID REFERENCES public.quotations(id) ON DELETE CASCADE,
    
    product_description TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    tax_rate DECIMAL(5,2) NOT NULL DEFAULT 0, -- Percentage (e.g., 18.00 for 18%)
    
    total_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;

-- Allow public access for now (match existing project pattern)
DROP POLICY IF EXISTS "Allow public access on quotations" ON public.quotations;
CREATE POLICY "Allow public access on quotations" ON public.quotations FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public access on quotation_items" ON public.quotation_items;
CREATE POLICY "Allow public access on quotation_items" ON public.quotation_items FOR ALL USING (true);
