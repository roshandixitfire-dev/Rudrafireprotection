-- Add detailed asset columns
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS wing text,
ADD COLUMN IF NOT EXISTS floor_count text,
ADD COLUMN IF NOT EXISTS basement text,
ADD COLUMN IF NOT EXISTS podium_count text,
ADD COLUMN IF NOT EXISTS alarm_system text,
ADD COLUMN IF NOT EXISTS hydrant_pumps integer,
ADD COLUMN IF NOT EXISTS sprinkler_pumps integer,
ADD COLUMN IF NOT EXISTS jockey_pumps integer,
ADD COLUMN IF NOT EXISTS standby_pumps integer,
ADD COLUMN IF NOT EXISTS booster_pumps integer,
ADD COLUMN IF NOT EXISTS hose_boxes integer,
ADD COLUMN IF NOT EXISTS courtyard_hydrant_valves text,
ADD COLUMN IF NOT EXISTS short_branch_pipes integer,
ADD COLUMN IF NOT EXISTS fire_extinguisher_abc integer,
ADD COLUMN IF NOT EXISTS fire_extinguisher_co2 integer,
ADD COLUMN IF NOT EXISTS extinguisher_expiry_date date;
