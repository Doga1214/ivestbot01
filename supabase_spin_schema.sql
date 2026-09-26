-- ==========================================================
-- SUPABASE / POSTGRESQL SCHEMA: LUCKY SPIN WHEEL SYSTEM
-- ==========================================================

-- 1. Table: spin_wheel_slices
CREATE TABLE IF NOT EXISTS public.spin_wheel_slices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slice_index INT NOT NULL UNIQUE,
    label VARCHAR(50) NOT NULL,
    sublabel VARCHAR(50),
    prize_type VARCHAR(30) NOT NULL, -- 'USDT', 'APR_BOOST', 'EXTRA_SPIN', 'COMMISSION_BOOST', 'TRY_AGAIN'
    prize_value NUMERIC(12, 4) DEFAULT 0,
    weight INT NOT NULL DEFAULT 10,  -- Higher weight = higher probability
    color_bg VARCHAR(30) NOT NULL DEFAULT '#1E293B',
    color_text VARCHAR(30) NOT NULL DEFAULT '#FFFFFF',
    accent_color VARCHAR(30) NOT NULL DEFAULT '#3B82F6',
    icon_name VARCHAR(50) DEFAULT 'Gift',
    is_jackpot BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Default 8 Slices
INSERT INTO public.spin_wheel_slices 
(slice_index, label, sublabel, prize_type, prize_value, weight, color_bg, color_text, accent_color, icon_name, is_jackpot)
VALUES
(0, '0.50 USDT', 'Direct to balance', 'USDT', 0.50, 350, '#1E293B', '#F8FAFC', '#38BDF8', 'Coins', FALSE),
(1, '+0.5% APR', '24h Yield Boost', 'APR_BOOST', 0.50, 250, '#0F172A', '#38BDF8', '#0EA5E9', 'Zap', FALSE),
(2, '1.00 USDT', 'Direct to balance', 'USDT', 1.00, 180, '#1E293B', '#F8FAFC', '#22C55E', 'DollarSign', FALSE),
(3, '+1 Free Spin', 'Play Again', 'EXTRA_SPIN', 1.00, 100, '#0F172A', '#EAB308', '#F59E0B', 'RotateCw', FALSE),
(4, '5.00 USDT', 'Direct to balance', 'USDT', 5.00, 70, '#1E293B', '#F8FAFC', '#A855F7', 'Sparkles', FALSE),
(5, '10.00 USDT', 'Direct to balance', 'USDT', 10.00, 35, '#0F172A', '#EC4899', '#F43F5E', 'Trophy', FALSE),
(6, '25.00 USDT', 'Super Reward', 'USDT', 25.00, 12, '#1E293B', '#F8FAFC', '#F97316', 'Flame', FALSE),
(7, '100 USDT', 'Mega Jackpot!', 'USDT', 100.00, 3, '#451A03', '#FEF08A', '#EAB308', 'Crown', TRUE)
ON CONFLICT (slice_index) DO NOTHING;

-- 2. Table: user_spins (User Spin Balances & Cooldowns)
CREATE TABLE IF NOT EXISTS public.user_spins (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    available_spins INT NOT NULL DEFAULT 1,
    daily_spins_claimed_today INT NOT NULL DEFAULT 0,
    last_daily_spin_at TIMESTAMPTZ,
    referral_spins INT NOT NULL DEFAULT 0,
    purchased_spins INT NOT NULL DEFAULT 0,
    lifetime_spins_count INT NOT NULL DEFAULT 0,
    total_won_usdt NUMERIC(14, 4) NOT NULL DEFAULT 0,
    active_apr_boost_percent NUMERIC(5, 2) DEFAULT 0,
    apr_boost_expires_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Table: spin_history (Audit Trail)
CREATE TABLE IF NOT EXISTS public.spin_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    slice_index INT NOT NULL,
    prize_label VARCHAR(50) NOT NULL,
    prize_type VARCHAR(30) NOT NULL,
    prize_value NUMERIC(12, 4) NOT NULL,
    spin_source VARCHAR(30) DEFAULT 'DAILY_FREE',
    transaction_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_spin_history_user_time ON public.spin_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_spin_history_created ON public.spin_history(created_at DESC);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.spin_wheel_slices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_spins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spin_history ENABLE ROW LEVEL SECURITY;

-- Slices are publicly readable
CREATE POLICY "Allow public read on spin_wheel_slices"
    ON public.spin_wheel_slices FOR SELECT USING (true);

-- User spins: users can read their own row
CREATE POLICY "Users can view own spin balance"
    ON public.user_spins FOR SELECT
    USING (auth.uid() = user_id);

-- Spin history: users can view their own history
CREATE POLICY "Users can view own spin history"
    ON public.spin_history FOR SELECT
    USING (auth.uid() = user_id);

-- Spin history: allow reading public recent winner feed
CREATE POLICY "Public read recent spin winners"
    ON public.spin_history FOR SELECT
    USING (true);
