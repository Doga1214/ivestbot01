-- ==============================================================================
-- IVESTBOT COMPREHENSIVE REFERRAL & AFFILIATE SYSTEM SCHEMA (SUPABASE POSTGRESQL)
-- ==============================================================================

-- 1. REFERRALS TABLE
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    referee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    referral_code VARCHAR(32) NOT NULL,
    tier_level VARCHAR(4) NOT NULL DEFAULT 'A' CHECK (tier_level IN ('A', 'B', 'C')),
    status VARCHAR(16) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'CLAIMED', 'REJECTED')),
    reward_amount_usdt NUMERIC(16, 4) NOT NULL DEFAULT 5.0000,
    has_deposited BOOLEAN NOT NULL DEFAULT FALSE,
    deposit_amount_usdt NUMERIC(16, 4) DEFAULT 0.0000,
    ip_address VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    claimed_at TIMESTAMPTZ,
    UNIQUE (referrer_id, referee_id)
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referee ON public.referrals(referee_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);

-- 2. REFERRAL WITHDRAWALS (PAYOUTS) TABLE
CREATE TABLE IF NOT EXISTS public.referral_withdrawals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount_usdt NUMERIC(16, 4) NOT NULL CHECK (amount_usdt >= 10.0000),
    wallet_address VARCHAR(128) NOT NULL,
    network VARCHAR(16) NOT NULL DEFAULT 'TRC20' CHECK (network IN ('TRC20', 'BEP20', 'ERC20')),
    status VARCHAR(16) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    tx_hash VARCHAR(256),
    admin_remarks TEXT,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ref_withdrawals_user ON public.referral_withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_ref_withdrawals_status ON public.referral_withdrawals(status);

-- 3. FRAUD LOGS TABLE
CREATE TABLE IF NOT EXISTS public.fraud_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    event_type VARCHAR(32) NOT NULL,
    severity VARCHAR(16) NOT NULL DEFAULT 'HIGH' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    action_taken VARCHAR(16) NOT NULL DEFAULT 'FLAGGED' CHECK (action_taken IN ('BLOCKED', 'FLAGGED', 'SUSPENDED', 'MONITORED')),
    risk_score INTEGER NOT NULL DEFAULT 50,
    details TEXT NOT NULL,
    ip_address VARCHAR(64),
    resolved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fraud_logs_user ON public.fraud_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_fraud_logs_severity ON public.fraud_logs(severity);

-- 4. REWARD TIERS CONFIGURATION TABLE
CREATE TABLE IF NOT EXISTS public.reward_tiers (
    tier INTEGER PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    min_referrals INTEGER NOT NULL,
    max_referrals INTEGER NOT NULL,
    reward_per_ref_usdt NUMERIC(16, 4) NOT NULL,
    tier_bonus_usdt NUMERIC(16, 4) NOT NULL,
    badge_color VARCHAR(16) NOT NULL
);

INSERT INTO public.reward_tiers (tier, name, min_referrals, max_referrals, reward_per_ref_usdt, tier_bonus_usdt, badge_color)
VALUES 
    (1, 'Bronze Ambassador', 0, 10, 5.0000, 25.0000, '#CD7F32'),
    (2, 'Silver Partner', 11, 25, 7.5000, 50.0000, '#C0C0C0'),
    (3, 'Gold Leader', 26, 50, 10.0000, 100.0000, '#FFD700'),
    (4, 'Diamond VIP', 51, 999999, 15.0000, 250.0000, '#00E5FF')
ON CONFLICT (tier) DO NOTHING;

-- 5. ATOMIC RPC: PROCESS REFERRAL ACTION (COMPLETION & BONUS CREDIT)
CREATE OR REPLACE FUNCTION public.process_referral_completion(
    p_referee_id UUID,
    p_deposit_amount NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_ref RECORD;
    v_sponsor_profile RECORD;
    v_sponsor_wallet RECORD;
    v_comm_a NUMERIC(16, 4) := 0;
BEGIN
    -- Check if referee has a pending referral record
    SELECT * INTO v_ref FROM public.referrals WHERE referee_id = p_referee_id LIMIT 1;
    
    IF v_ref IS NOT NULL AND v_ref.status = 'PENDING' THEN
        -- Calculate 1% Level A commission + 5 USDT base reward
        v_comm_a := 5.0000 + (p_deposit_amount * 0.0100);

        -- Update referral record
        UPDATE public.referrals
        SET status = 'COMPLETED',
            has_deposited = TRUE,
            deposit_amount_usdt = p_deposit_amount,
            reward_amount_usdt = v_comm_a,
            completed_at = NOW()
        WHERE id = v_ref.id;

        -- Record transaction in wallet_transactions for sponsor
        INSERT INTO public.wallet_transactions (
            user_id,
            type,
            amount,
            currency,
            status,
            description
        ) VALUES (
            v_ref.referrer_id,
            'REFERRAL_BONUS',
            v_comm_a,
            'USDT',
            'COMPLETED',
            'Referral Commission & Activation Reward (Referee: ' || p_referee_id || ')'
        );

        RETURN jsonb_build_object(
            'success', TRUE,
            'referral_id', v_ref.id,
            'reward_credited', v_comm_a
        );
    END IF;

    RETURN jsonb_build_object('success', FALSE, 'message', 'No pending referral found or already completed.');
END;
$$;
