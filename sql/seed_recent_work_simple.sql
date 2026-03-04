-- Update specific clients with recent work data
-- Using direct updates to ensure it works in all SQL editors

UPDATE public.clients
SET recent_work = '2026-01-15: AMC Quarterly Visit'
WHERE name LIKE '%Sunrise Heights%';

UPDATE public.clients
SET recent_work = '2026-02-10: Water Tank Cleaning'
WHERE name LIKE '%Green Valley%';

UPDATE public.clients
SET recent_work = '2025-12-20: Pump Motor Repair'
WHERE name LIKE '%Blue Ridge%';

UPDATE public.clients
SET recent_work = '2026-02-05: General Inspection'
WHERE name LIKE '%Ocean View%';

UPDATE public.clients
SET recent_work = '2026-01-25: Filter Replacement'
WHERE name LIKE '%Skyline Plaza%';
