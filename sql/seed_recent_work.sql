-- Update all clients with random recent work data from the last 2 months

-- Create a temporary table or CTE to generate random data
DO $$
DECLARE 
    r RECORD;
    random_days INT;
    random_work TEXT;
    work_types TEXT[] := ARRAY['AMC Visit', 'Tank Cleaning', 'Pump Repair', 'Water Testing', 'Filter Replacement', 'General Inspection'];
BEGIN
    FOR r IN SELECT id FROM public.clients LOOP
        -- Generate random days between 1 and 60 (last 2 months)
        random_days := floor(random() * 60 + 1);
        -- Pick a random work type
        random_work := work_types[floor(random() * array_length(work_types, 1) + 1)];
        
        -- Update the record
        UPDATE public.clients
        SET recent_work = to_char(now() - (random_days || ' days')::interval, 'YYYY-MM-DD') || ': ' || random_work
        WHERE id = r.id;
    END LOOP;
END $$;
