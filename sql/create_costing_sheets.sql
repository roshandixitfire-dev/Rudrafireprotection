-- ==================================================================================
-- SCHEMA FOR COSTING MODULE
-- Run this in your Supabase SQL Editor if needed, or it will auto-fallback.
-- ==================================================================================

CREATE TABLE IF NOT EXISTS public.costing_sheets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    costing_no TEXT UNIQUE NOT NULL,
    project_name TEXT,
    developer_name TEXT,
    client_id BIGINT REFERENCES public.clients(id) ON DELETE SET NULL,
    costing_date DATE NOT NULL DEFAULT CURRENT_DATE,
    ref_no TEXT,
    
    total_purchase_cost DECIMAL(12,2) DEFAULT 0,
    total_supply_cost DECIMAL(12,2) DEFAULT 0,
    total_labour_cost DECIMAL(12,2) DEFAULT 0,
    total_overhead_cost DECIMAL(12,2) DEFAULT 0,
    actual_costing_total DECIMAL(12,2) DEFAULT 0,
    quoted_total DECIMAL(12,2) DEFAULT 0,
    projected_profit DECIMAL(12,2) DEFAULT 0,
    profit_margin_pct DECIMAL(6,2) DEFAULT 0,
    
    raw_json JSONB,
    status TEXT DEFAULT 'Draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.costing_sheets ENABLE ROW LEVEL SECURITY;

-- Allow public access (matches existing project pattern)
DROP POLICY IF EXISTS "Public Full Access" ON public.costing_sheets;
CREATE POLICY "Public Full Access" ON public.costing_sheets FOR ALL USING (true);
