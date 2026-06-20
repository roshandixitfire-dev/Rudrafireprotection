-- Standardize document sequences for Invoices and Quotations
CREATE TABLE IF NOT EXISTS public.document_sequences (
    p_key TEXT PRIMARY KEY,
    last_value INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.document_sequences ENABLE ROW LEVEL SECURITY;

-- Allow public access for now (match project pattern)
DROP POLICY IF EXISTS "Allow public access on document_sequences" ON public.document_sequences;
CREATE POLICY "Allow public access on document_sequences" ON public.document_sequences FOR ALL USING (true);

-- Function to get and increment the next sequence number for a given key
CREATE OR REPLACE FUNCTION public.next_doc_sequence(p_key TEXT)
RETURNS INTEGER AS $$
DECLARE
    next_val INTEGER;
BEGIN
    INSERT INTO public.document_sequences (p_key, last_value)
    VALUES (p_key, 1)
    ON CONFLICT (p_key) DO UPDATE
    SET last_value = document_sequences.last_value + 1,
        updated_at = NOW()
    RETURNING last_value INTO next_val;
    
    RETURN next_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
