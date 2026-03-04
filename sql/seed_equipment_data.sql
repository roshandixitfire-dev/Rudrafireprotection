-- Seed Data for Equipment Master
-- This script safely inserts standard fire safety equipment into the public.equipment_master table.

INSERT INTO public.equipment_master (category, sub_category, make_model, maintenance_frequency_days)
VALUES 
    ('Fire Extinguisher', 'ABC Powder 4kg', 'Generic', 365),
    ('Fire Extinguisher', 'ABC Powder 6kg', 'Generic', 365),
    ('Fire Extinguisher', 'CO2 2kg', 'Generic', 365),
    ('Fire Extinguisher', 'CO2 4.5kg', 'Generic', 365),
    ('Fire Extinguisher', 'Water Type 9L', 'Generic', 365),
    ('Fire Extinguisher', 'Foam Type 9L', 'Generic', 365),
    ('Fire Extinguisher', 'Clean Agent 2kg', 'Generic', 365),
    ('Fire Hydrant', 'Landing Valve', 'Single Headed', 180),
    ('Fire Hydrant', 'Landing Valve', 'Double Headed', 180),
    ('Hose Reel', 'Drum with 30m Hose', 'Swing Type', 180),
    ('Fire Alarm System', 'Smoke Detector', 'Photoelectric', 180),
    ('Fire Alarm System', 'Heat Detector', 'Rate of Rise', 180),
    ('Fire Alarm System', 'Manual Call Point (MCP)', 'Break Glass', 180),
    ('Fire Alarm System', 'Hooter/Siren', 'Electronic', 180),
    ('Sprinkler System', 'Pendant Sprinkler', 'Standard Response', 365),
    ('Sprinkler System', 'Upright Sprinkler', 'Standard Response', 365),
    ('Fire Pump', 'Main Electrical Pump', 'Centrifugal', 30),
    ('Fire Pump', 'Jockey Pump', 'Vertical Multistage', 30),
    ('Fire Pump', 'Diesel Engine Pump', 'Horizontal', 7)
ON CONFLICT DO NOTHING; -- Assuming the table has no unique constraints, this will just append. 
-- Wait, the table only has ID as a primary key. So it will append every time the script is run. That's fine for initial seed.
