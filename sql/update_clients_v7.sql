-- Add detailed technical and site fields for fire safety management
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS developer_name text,
ADD COLUMN IF NOT EXISTS wings text,
ADD COLUMN IF NOT EXISTS ground_floor text,
ADD COLUMN IF NOT EXISTS stilt text,
ADD COLUMN IF NOT EXISTS landmark text,
-- Smoke Detectors
ADD COLUMN IF NOT EXISTS sd_meter_room boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS sd_lift_machine_room boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS sd_electric_duct boolean DEFAULT false,
-- Asset Variants
ADD COLUMN IF NOT EXISTS hydrant_valve_type text DEFAULT 'Single', -- Single/Double
ADD COLUMN IF NOT EXISTS hosreel_drum_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS courtyard_hydrant_valve_type text DEFAULT 'Single',
ADD COLUMN IF NOT EXISTS courtyard_hydrant_valve_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS hosebox_type text DEFAULT 'Single',
ADD COLUMN IF NOT EXISTS hosebox_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS canvas_hosepipe_count integer DEFAULT 0,
-- Extinguishers
ADD COLUMN IF NOT EXISTS fire_extinguisher_clean_agent integer DEFAULT 0,
-- Pumps
ADD COLUMN IF NOT EXISTS pump_type text DEFAULT 'Centrifugal', -- Submersible/Centrifugal
ADD COLUMN IF NOT EXISTS pump_hydrant integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS pump_sprinkler integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS pump_hydrant_jockey integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS pump_sprinkler_jockey integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS pump_standby_hydrant integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS pump_standby_sprinkler integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS pump_standby_jockey integer DEFAULT 0,
-- Sprinkler System Coverage
ADD COLUMN IF NOT EXISTS ss_ground boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS ss_basement boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS ss_podium boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS ss_lift_lobby boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS ss_flat boolean DEFAULT false;
