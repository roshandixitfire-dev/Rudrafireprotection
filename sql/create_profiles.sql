-- Create Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid references auth.users on delete cascade primary key,
    role text check (role in ('admin', 'employee', 'client')) default 'client',
    full_name text,
    company text,
    created_at timestamptz default now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for public.profiles
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Assign Admin role to the main user
INSERT INTO public.profiles (id, role, full_name)
VALUES ('04812cfd-b428-4384-be13-6a82698f14ec', 'admin', 'Roshan Dixit')
ON CONFLICT (id) DO UPDATE SET role = 'admin';
