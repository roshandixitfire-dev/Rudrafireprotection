-- Seed Client Activities

INSERT INTO public.client_activities (client_id, activity_type, activity_date, activity_time, remarks)
SELECT id, 'Service Visit', '2026-02-15', '10:00:00', 'Routine checkup completed.'
FROM public.clients WHERE name LIKE '%Sunrise Heights%';

INSERT INTO public.client_activities (client_id, activity_type, activity_date, activity_time, remarks)
SELECT id, 'Refilling', '2026-02-14', '14:30:00', 'Refilled 50L chemical.'
FROM public.clients WHERE name LIKE '%Green Valley%';

INSERT INTO public.client_activities (client_id, activity_type, activity_date, activity_time, remarks)
SELECT id, 'Breakdown', '2026-02-12', '09:15:00', 'Motor not starting. Repaired on site.'
FROM public.clients WHERE name LIKE '%Blue Ridge%';

INSERT INTO public.client_activities (client_id, activity_type, activity_date, activity_time, remarks)
SELECT id, 'Meeting', '2026-02-10', '11:00:00', 'Discussed contract renewal.'
FROM public.clients WHERE name LIKE '%Ocean View%';

INSERT INTO public.client_activities (client_id, activity_type, activity_date, activity_time, remarks)
SELECT id, 'Cheque Collection', '2026-02-08', '16:00:00', 'Collected payment for Jan invoice.'
FROM public.clients WHERE name LIKE '%Skyline Plaza%';
