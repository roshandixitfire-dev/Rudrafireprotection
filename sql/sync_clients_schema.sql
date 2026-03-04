-- Comprehensive Schema Sync for public.clients
-- This script ensures all columns used in src/app/dashboard/clients/actions.ts exist in the database.

ALTER TABLE public.clients
-- Basic Info & Location
ADD COLUMN IF NOT EXISTS developer_name text,
ADD COLUMN IF NOT EXISTS landmark text,
ADD COLUMN IF NOT EXISTS area text,
ADD COLUMN IF NOT EXISTS district text DEFAULT 'Mumbai',
ADD COLUMN IF NOT EXISTS state text DEFAULT 'Maharashtra',
ADD COLUMN IF NOT EXISTS pincode text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS email text,

-- Building Specs
ADD COLUMN IF NOT EXISTS wings text,
ADD COLUMN IF NOT EXISTS ground_floor text,
ADD COLUMN IF NOT EXISTS stilt text,
ADD COLUMN IF NOT EXISTS basement text,
ADD COLUMN IF NOT EXISTS podium_count text,
ADD COLUMN IF NOT EXISTS floor_count text,

-- System Config
ADD COLUMN IF NOT EXISTS system_type text,
ADD COLUMN IF NOT EXISTS alarm_system text,

-- Smoke Detectors
ADD COLUMN IF NOT EXISTS sd_meter_room boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS sd_lift_machine_room boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS sd_electric_duct boolean DEFAULT false,

-- Assets (Standardized Names)
ADD COLUMN IF NOT EXISTS hydrant_valve_type text DEFAULT 'Single',
ADD COLUMN IF NOT EXISTS hosreel_drum_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS courtyard_hydrant_valve_type text DEFAULT 'Single',
ADD COLUMN IF NOT EXISTS courtyard_hydrant_valve_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS hosebox_type text DEFAULT 'Single',
ADD COLUMN IF NOT EXISTS hosebox_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS short_branch_pipe_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS canvas_hosepipe_count integer DEFAULT 0,

-- Extinguishers
ADD COLUMN IF NOT EXISTS fire_extinguisher_abc_qty integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS fire_extinguisher_co2_qty integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS fire_extinguisher_clean_agent_qty integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS extinguisher_expiry_date date,

-- Pumps
ADD COLUMN IF NOT EXISTS pump_type text DEFAULT 'Centrifugal',
ADD COLUMN IF NOT EXISTS pump_hydrant integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS pump_sprinkler integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS pump_hydrant_jockey integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS pump_sprinkler_jockey integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS pump_standby_hydrant integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS pump_standby_sprinkler integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS pump_standby_jockey integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS pump_booster integer DEFAULT 0,

-- Sprinkler Coverage
ADD COLUMN IF NOT EXISTS ss_ground boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS ss_basement boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS ss_podium boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS ss_lift_lobby boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS ss_flat boolean DEFAULT false,

-- Contract & Sales
ADD COLUMN IF NOT EXISTS service_plan text,
ADD COLUMN IF NOT EXISTS amc_start_date date,
ADD COLUMN IF NOT EXISTS amc_end_date date,
ADD COLUMN IF NOT EXISTS sales_person text,
ADD COLUMN IF NOT EXISTS client_reference text,
ADD COLUMN IF NOT EXISTS recent_work text;

-- Data migration if old columns exist
DO $$
BEGIN
    -- Handle existing column renames/migrations if they exist
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='wing') THEN
        UPDATE public.clients SET wings = wing WHERE wings IS NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='hydrant_pumps') THEN
        UPDATE public.clients SET pump_hydrant = hydrant_pumps WHERE pump_hydrant = 0;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='fire_extinguisher_abc') THEN
        UPDATE public.clients SET fire_extinguisher_abc_qty = fire_extinguisher_abc WHERE fire_extinguisher_abc_qty = 0;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='fire_extinguisher_co2') THEN
        UPDATE public.clients SET fire_extinguisher_co2_qty = fire_extinguisher_co2 WHERE fire_extinguisher_co2_qty = 0;
    END IF;
END $$;
