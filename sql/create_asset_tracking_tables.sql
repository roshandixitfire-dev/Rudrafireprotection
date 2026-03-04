-- 1. Create ENUM types for standardization
DO $$ BEGIN
    CREATE TYPE asset_condition AS ENUM ('Excellent', 'Good', 'Fair', 'Poor', 'Condemned');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE service_action AS ENUM ('Serviced', 'Repaired', 'Refilled', 'Replaced');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. The Catalog: equipment_master
CREATE TABLE IF NOT EXISTS public.equipment_master (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL, 
    sub_category TEXT,      
    make_model TEXT,
    maintenance_frequency_days INTEGER NOT NULL DEFAULT 365,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. The Physical Items: client_assets
CREATE TABLE IF NOT EXISTS public.client_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id BIGINT REFERENCES public.clients(id) ON DELETE CASCADE, 
    equipment_id UUID REFERENCES public.equipment_master(id),
    
    qr_code_hash TEXT UNIQUE,          
    manual_asset_tag TEXT UNIQUE,      
    
    exact_location TEXT NOT NULL,      
    current_condition asset_condition DEFAULT 'Excellent',
    installation_date DATE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. The Audit Log: asset_service_history
CREATE TABLE IF NOT EXISTS public.asset_service_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES public.client_assets(id) ON DELETE CASCADE,
    
    service_date DATE NOT NULL DEFAULT CURRENT_DATE,
    condition_reported asset_condition NOT NULL,
    parts_replaced TEXT,               
    action_taken service_action NOT NULL,
    
    next_due_date DATE NOT NULL,       
    serviced_by TEXT,                  
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies structure so the dashboard can access them
ALTER TABLE public.equipment_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_service_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public select on equipment_master" ON public.equipment_master;
DROP POLICY IF EXISTS "Allow public insert on equipment_master" ON public.equipment_master;
DROP POLICY IF EXISTS "Allow public update on equipment_master" ON public.equipment_master;
DROP POLICY IF EXISTS "Allow public delete on equipment_master" ON public.equipment_master;

CREATE POLICY "Allow public select on equipment_master" ON public.equipment_master FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert on equipment_master" ON public.equipment_master FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public update on equipment_master" ON public.equipment_master FOR UPDATE TO public USING (true);
CREATE POLICY "Allow public delete on equipment_master" ON public.equipment_master FOR DELETE TO public USING (true);

DROP POLICY IF EXISTS "Allow public select on client_assets" ON public.client_assets;
DROP POLICY IF EXISTS "Allow public insert on client_assets" ON public.client_assets;
DROP POLICY IF EXISTS "Allow public update on client_assets" ON public.client_assets;
DROP POLICY IF EXISTS "Allow public delete on client_assets" ON public.client_assets;

CREATE POLICY "Allow public select on client_assets" ON public.client_assets FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert on client_assets" ON public.client_assets FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public update on client_assets" ON public.client_assets FOR UPDATE TO public USING (true);
CREATE POLICY "Allow public delete on client_assets" ON public.client_assets FOR DELETE TO public USING (true);

DROP POLICY IF EXISTS "Allow public select on asset_service_history" ON public.asset_service_history;
DROP POLICY IF EXISTS "Allow public insert on asset_service_history" ON public.asset_service_history;
DROP POLICY IF EXISTS "Allow public update on asset_service_history" ON public.asset_service_history;
DROP POLICY IF EXISTS "Allow public delete on asset_service_history" ON public.asset_service_history;

CREATE POLICY "Allow public select on asset_service_history" ON public.asset_service_history FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert on asset_service_history" ON public.asset_service_history FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public update on asset_service_history" ON public.asset_service_history FOR UPDATE TO public USING (true);
CREATE POLICY "Allow public delete on asset_service_history" ON public.asset_service_history FOR DELETE TO public USING (true);
