-- ==============================================================================
-- AUTOMATIC SUPABASE TRIGGER: SYNC auth.users TO public.users TABLE
-- Paste this script into Supabase Dashboard -> SQL Editor and click RUN.
-- ==============================================================================

-- 1. Ensure public.users table exists with correct schema
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    avatar TEXT DEFAULT '🎭',
    provider TEXT DEFAULT 'email',
    is_admin BOOLEAN DEFAULT false,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    pranks_launched INTEGER DEFAULT 0,
    pranks_published INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create PostgreSQL Function to handle new signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (
        id,
        email,
        display_name,
        avatar,
        provider,
        is_admin,
        xp,
        level,
        created_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'avatar', '🎭'),
        COALESCE(NEW.raw_app_meta_data->>'provider', 'email'),
        false,
        0,
        1,
        COALESCE(NEW.created_at, NOW())
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        display_name = EXCLUDED.display_name;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Attach Trigger to auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Enable Row Level Security (RLS) & Grant Full Access Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read users" ON public.users;
DROP POLICY IF EXISTS "Allow public insert users" ON public.users;
DROP POLICY IF EXISTS "Allow public update users" ON public.users;
DROP POLICY IF EXISTS "Allow public delete users" ON public.users;

CREATE POLICY "Allow public read users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow public insert users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update users" ON public.users FOR UPDATE USING (true);
CREATE POLICY "Allow public delete users" ON public.users FOR DELETE USING (true);

-- 5. BACKFILL: Immediately copy all existing auth.users into public.users
INSERT INTO public.users (id, email, display_name, avatar, provider, is_admin, xp, level, created_at)
SELECT 
    id,
    email,
    COALESCE(raw_user_meta_data->>'display_name', split_part(email, '@', 1)),
    COALESCE(raw_user_meta_data->>'avatar', '🎭'),
    'email',
    false,
    0,
    1,
    created_at
FROM auth.users
ON CONFLICT (id) DO NOTHING;
