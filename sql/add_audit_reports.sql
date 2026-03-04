CREATE TABLE public.audit_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id BIGINT REFERENCES public.clients(id) ON DELETE CASCADE,
    report_date DATE NOT NULL,
    auditor_name TEXT NOT NULL,
    report_type TEXT,
    status TEXT DEFAULT 'Draft',
    findings TEXT,
    recommendations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.audit_reports ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users
CREATE POLICY "Allow read access to authenticated users" ON public.audit_reports
    FOR SELECT TO authenticated USING (true);

-- Allow insert access to authenticated users
CREATE POLICY "Allow insert access to authenticated users" ON public.audit_reports
    FOR INSERT TO authenticated WITH CHECK (true);

-- Allow update access to authenticated users
CREATE POLICY "Allow update access to authenticated users" ON public.audit_reports
    FOR UPDATE TO authenticated USING (true);

-- Allow delete access to authenticated users
CREATE POLICY "Allow delete access to authenticated users" ON public.audit_reports
    FOR DELETE TO authenticated USING (true);
