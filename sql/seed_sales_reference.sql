-- Update clients with Sales Person and Reference data

UPDATE public.clients
SET sales_person = 'Rahul Sharma', client_reference = 'Website Inquiry'
WHERE name LIKE '%Sunrise Heights%';

UPDATE public.clients
SET sales_person = 'Priya Patel', client_reference = 'Resident Referral'
WHERE name LIKE '%Green Valley%';

UPDATE public.clients
SET sales_person = 'Vikram Singh', client_reference = 'LinkedIn'
WHERE name LIKE '%Blue Ridge%';

UPDATE public.clients
SET sales_person = 'Amit Desai', client_reference = 'Cold Call'
WHERE name LIKE '%Ocean View%';

UPDATE public.clients
SET sales_person = 'Neha Gupta', client_reference = 'Property Exhibition'
WHERE name LIKE '%Skyline Plaza%';
