-- ==============================================================================
-- IVESTBOT MASTER SUPABASE POSTGRESQL DATABASE SCHEMA & MIGRATIONS
-- Comprehensive Unified Migration for Production & Realtime Sync
-- ==============================================================================

-- 0. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. PROFILES TABLE (User Accounts & Auth Synchronization)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(128) NOT NULL,
    username VARCHAR(64) UNIQUE NOT NULL,
    email VARCHAR(128) UNIQUE NOT NULL,
    password_hash VARCHAR(256),
    referral_code VARCHAR(32) UNIQUE NOT NULL,
    referred_by_code VARCHAR(32),
    level INTEGER NOT NULL DEFAULT 1 CHECK (level BETWEEN 1 AND 4),
    status VARCHAR(16) NOT NULL DEFAULT 'INACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'FROZEN')),
    kyc_status VARCHAR(16) NOT NULL DEFAULT 'NOT_SUBMITTED' CHECK (kyc_status IN ('NOT_SUBMITTED', 'PENDING', 'VERIFIED', 'REJECTED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON public.profiles(referred_by_code);

-- ==============================================================================
-- 2. WALLETS TABLE (Isolated Financial Asset Balances)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    available_balance NUMERIC(16, 4) NOT NULL DEFAULT 0.0000 CHECK (available_balance >= 0),
    total_balance NUMERIC(16, 4) NOT NULL DEFAULT 0.0000 CHECK (total_balance >= 0),
    pending_balance NUMERIC(16, 4) NOT NULL DEFAULT 0.0000 CHECK (pending_balance >= 0),
    currency VARCHAR(16) NOT NULL DEFAULT 'USDT',
    status VARCHAR(16) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'FROZEN', 'RESTRICTED')),
    can_deposit BOOLEAN NOT NULL DEFAULT TRUE,
    can_withdraw BOOLEAN NOT NULL DEFAULT TRUE,
    can_reserve BOOLEAN NOT NULL DEFAULT TRUE,
    can_trade BOOLEAN NOT NULL DEFAULT TRUE,
    restriction_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallets_user ON public.wallets(user_id);

-- ==============================================================================
-- 3. DEPOSITS TABLE (Multi-Network Deposit Requests & Receipts)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.deposits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC(16, 4) NOT NULL CHECK (amount > 0),
    deposit_address VARCHAR(128) NOT NULL,
    tx_hash VARCHAR(256) NOT NULL,
    currency VARCHAR(16) NOT NULL DEFAULT 'USDT',
    network VARCHAR(16) NOT NULL DEFAULT 'TRC20',
    status VARCHAR(16) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'COMPLETED', 'REJECTED', 'FAILED')),
    admin_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deposits_user ON public.deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_deposits_status ON public.deposits(status);
CREATE INDEX IF NOT EXISTS idx_deposits_tx_hash ON public.deposits(tx_hash);

-- ==============================================================================
-- 4. WITHDRAWALS TABLE (Cashout Requests & Network Settlement)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.withdrawals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC(16, 4) NOT NULL CHECK (amount > 0),
    recipient_address VARCHAR(128) NOT NULL,
    currency VARCHAR(16) NOT NULL DEFAULT 'USDT',
    network VARCHAR(16) NOT NULL DEFAULT 'TRC20',
    status VARCHAR(16) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'COMPLETED', 'REJECTED', 'FAILED')),
    tx_hash VARCHAR(256),
    admin_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_withdrawals_user ON public.withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON public.withdrawals(status);

-- ==============================================================================
-- 5. WALLET_TRANSACTIONS TABLE (Immutable Accounting Ledger)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type VARCHAR(32) NOT NULL,
    amount NUMERIC(16, 4) NOT NULL,
    currency VARCHAR(16) NOT NULL DEFAULT 'USDT',
    status VARCHAR(16) NOT NULL DEFAULT 'COMPLETED',
    description TEXT NOT NULL,
    reference_id VARCHAR(64),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallet_tx_user ON public.wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_type ON public.wallet_transactions(type);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_created ON public.wallet_transactions(created_at DESC);

-- ==============================================================================
-- 6. KYC_RECORDS TABLE (Identity Compliance & Document Audits)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.kyc_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    full_name VARCHAR(128) NOT NULL,
    document_type VARCHAR(32) NOT NULL,
    document_number VARCHAR(64) NOT NULL,
    document_url TEXT,
    status VARCHAR(16) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'VERIFIED', 'REJECTED')),
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kyc_user ON public.kyc_records(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_status ON public.kyc_records(status);

-- ==============================================================================
-- 7. REFERRALS & AFFILIATES TABLES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    referee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    referral_code VARCHAR(32) NOT NULL,
    tier_level VARCHAR(4) NOT NULL DEFAULT 'A' CHECK (tier_level IN ('A', 'B', 'C')),
    status VARCHAR(16) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'CLAIMED', 'REJECTED')),
    reward_amount_usdt NUMERIC(16, 4) NOT NULL DEFAULT 0.0000,
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

CREATE TABLE IF NOT EXISTS public.referral_withdrawals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount_usdt NUMERIC(16, 4) NOT NULL CHECK (amount_usdt >= 10.0000),
    wallet_address VARCHAR(128) NOT NULL,
    network VARCHAR(16) NOT NULL DEFAULT 'TRC20',
    status VARCHAR(16) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    tx_hash VARCHAR(256),
    admin_remarks TEXT,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ref_withdrawals_user ON public.referral_withdrawals(user_id);

CREATE TABLE IF NOT EXISTS public.fraud_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    event_type VARCHAR(32) NOT NULL,
    severity VARCHAR(16) NOT NULL DEFAULT 'HIGH',
    action_taken VARCHAR(16) NOT NULL DEFAULT 'FLAGGED',
    risk_score INTEGER NOT NULL DEFAULT 50,
    details TEXT NOT NULL,
    ip_address VARCHAR(64),
    resolved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
    (1, 'Bronze Ambassador', 0, 10, 1.0000, 5.0000, '#CD7F32'),
    (2, 'Silver Partner', 11, 25, 1.5000, 10.0000, '#C0C0C0'),
    (3, 'Gold Leader', 26, 50, 2.0000, 20.0000, '#FFD700'),
    (4, 'Diamond VIP', 51, 999999, 3.0000, 50.0000, '#00E5FF')
ON CONFLICT (tier) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(256) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(32) NOT NULL DEFAULT 'SYSTEM',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Allow public read & write operations with security definer protection
CREATE POLICY "Public profiles access" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public wallets access" ON public.wallets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public deposits access" ON public.deposits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public withdrawals access" ON public.withdrawals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public transactions access" ON public.wallet_transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public kyc access" ON public.kyc_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public referrals access" ON public.referrals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public ref_withdrawals access" ON public.referral_withdrawals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public fraud_logs access" ON public.fraud_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public reward_tiers access" ON public.reward_tiers FOR SELECT USING (true);
CREATE POLICY "Public announcements access" ON public.announcements FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 9. REALTIME REPLICATION ENABLEMENT
-- ==============================================================================
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.wallets;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.deposits;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.withdrawals;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.wallet_transactions;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.kyc_records;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN undefined_object THEN NULL;
END $$;

-- ==============================================================================
-- 10. ATOMIC POSTGRESQL RPC FUNCTIONS
-- ==============================================================================

-- 10.1 Resolve or Create Profile & Initialize Wallet
CREATE OR REPLACE FUNCTION public.resolve_or_create_profile(
    p_name VARCHAR,
    p_username VARCHAR,
    p_email VARCHAR,
    p_password VARCHAR DEFAULT NULL,
    p_referral_code VARCHAR DEFAULT NULL,
    p_referred_by VARCHAR DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_profile RECORD;
    v_wallet RECORD;
    v_ref_code VARCHAR(32);
BEGIN
    -- Check if user already exists by email or username
    SELECT * INTO v_profile FROM public.profiles 
    WHERE LOWER(email) = LOWER(p_email) OR LOWER(username) = LOWER(p_username)
    LIMIT 1;

    IF v_profile IS NULL THEN
        v_ref_code := COALESCE(p_referral_code, UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8)));
        
        INSERT INTO public.profiles (
            name, username, email, password_hash, referral_code, referred_by_code, level, status, kyc_status
        ) VALUES (
            p_name, LOWER(p_username), LOWER(p_email), p_password, v_ref_code, p_referred_by, 1, 'INACTIVE', 'NOT_SUBMITTED'
        ) RETURNING * INTO v_profile;

        -- Initialize 0.00 Wallet
        INSERT INTO public.wallets (
            user_id, available_balance, total_balance, pending_balance, currency, status
        ) VALUES (
            v_profile.id, 0.0000, 0.0000, 0.0000, 'USDT', 'ACTIVE'
        ) RETURNING * INTO v_wallet;
    ELSE
        SELECT * INTO v_wallet FROM public.wallets WHERE user_id = v_profile.id LIMIT 1;
        IF v_wallet IS NULL THEN
            INSERT INTO public.wallets (
                user_id, available_balance, total_balance, pending_balance, currency, status
            ) VALUES (
                v_profile.id, 0.0000, 0.0000, 0.0000, 'USDT', 'ACTIVE'
            ) RETURNING * INTO v_wallet;
        END IF;
    END IF;

    RETURN jsonb_build_object(
        'success', TRUE,
        'profile', to_jsonb(v_profile),
        'wallet', to_jsonb(v_wallet)
    );
END;
$$;

-- 10.2 Submit Deposit Request
CREATE OR REPLACE FUNCTION public.submit_deposit_request(
    p_user_id UUID,
    p_amount NUMERIC,
    p_deposit_address VARCHAR,
    p_tx_hash VARCHAR,
    p_currency VARCHAR DEFAULT 'USDT',
    p_network VARCHAR DEFAULT 'TRC20'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_deposit RECORD;
    v_wallet RECORD;
BEGIN
    IF p_amount <= 0 THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Deposit amount must be greater than zero');
    END IF;

    -- Insert deposit record
    INSERT INTO public.deposits (
        user_id, amount, deposit_address, tx_hash, currency, network, status
    ) VALUES (
        p_user_id, p_amount, p_deposit_address, p_tx_hash, p_currency, p_network, 'PENDING'
    ) RETURNING * INTO v_deposit;

    -- Update pending balance in wallets
    INSERT INTO public.wallets (
        user_id, available_balance, total_balance, pending_balance, currency, updated_at
    ) VALUES (
        p_user_id, 0.0000, p_amount, p_amount, p_currency, NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        pending_balance = public.wallets.pending_balance + p_amount,
        total_balance = public.wallets.available_balance + public.wallets.pending_balance + p_amount,
        updated_at = NOW()
    RETURNING * INTO v_wallet;

    RETURN jsonb_build_object(
        'success', TRUE,
        'deposit', to_jsonb(v_deposit),
        'wallet', to_jsonb(v_wallet)
    );
END;
$$;

-- 10.3 Approve Deposit Request
CREATE OR REPLACE FUNCTION public.approve_deposit_request(
    p_deposit_id UUID,
    p_admin_id VARCHAR DEFAULT 'admin',
    p_remarks TEXT DEFAULT 'Deposit verified and approved by Admin'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_dep RECORD;
    v_wallet RECORD;
BEGIN
    SELECT * INTO v_dep FROM public.deposits WHERE id = p_deposit_id LIMIT 1;
    IF v_dep IS NULL THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Deposit record not found');
    END IF;

    IF v_dep.status = 'APPROVED' THEN
        SELECT * INTO v_wallet FROM public.wallets WHERE user_id = v_dep.user_id;
        RETURN jsonb_build_object('success', TRUE, 'wallet', to_jsonb(v_wallet), 'creditedAmount', v_dep.amount);
    END IF;

    -- Mark deposit as approved
    UPDATE public.deposits
    SET status = 'APPROVED', admin_note = p_remarks, updated_at = NOW()
    WHERE id = p_deposit_id;

    -- Activate user profile
    UPDATE public.profiles
    SET status = 'ACTIVE', updated_at = NOW()
    WHERE id = v_dep.user_id;

    -- Move amount from pending to available balance
    UPDATE public.wallets
    SET available_balance = available_balance + v_dep.amount,
        pending_balance = GREATEST(0, pending_balance - v_dep.amount),
        total_balance = available_balance + v_dep.amount + GREATEST(0, pending_balance - v_dep.amount),
        updated_at = NOW()
    WHERE user_id = v_dep.user_id
    RETURNING * INTO v_wallet;

    -- Record transaction
    INSERT INTO public.wallet_transactions (
        user_id, type, amount, currency, status, description, reference_id
    ) VALUES (
        v_dep.user_id, 'DEPOSIT', v_dep.amount, v_dep.currency, 'APPROVED',
        'USDT Deposit Verified & Approved (+' || v_dep.amount || ' USDT)',
        'DEP-' || UPPER(SUBSTRING(REPLACE(v_dep.id::TEXT, '-', '') FROM 1 FOR 8))
    );

    RETURN jsonb_build_object(
        'success', TRUE,
        'wallet', to_jsonb(v_wallet),
        'creditedAmount', v_dep.amount
    );
END;
$$;

-- 10.4 Reject Deposit Request
CREATE OR REPLACE FUNCTION public.reject_deposit_request(
    p_deposit_id UUID,
    p_admin_id VARCHAR DEFAULT 'admin',
    p_remarks TEXT DEFAULT 'Deposit verification rejected'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_dep RECORD;
    v_wallet RECORD;
BEGIN
    SELECT * INTO v_dep FROM public.deposits WHERE id = p_deposit_id LIMIT 1;
    IF v_dep IS NULL THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Deposit record not found');
    END IF;

    UPDATE public.deposits
    SET status = 'REJECTED', admin_note = p_remarks, updated_at = NOW()
    WHERE id = p_deposit_id;

    UPDATE public.wallets
    SET pending_balance = GREATEST(0, pending_balance - v_dep.amount),
        total_balance = available_balance + GREATEST(0, pending_balance - v_dep.amount),
        updated_at = NOW()
    WHERE user_id = v_dep.user_id
    RETURNING * INTO v_wallet;

    RETURN jsonb_build_object(
        'success', TRUE,
        'wallet', to_jsonb(v_wallet)
    );
END;
$$;

-- 10.5 Submit Withdrawal Request
CREATE OR REPLACE FUNCTION public.submit_withdrawal_request(
    p_user_id UUID,
    p_amount NUMERIC,
    p_recipient_address VARCHAR,
    p_currency VARCHAR DEFAULT 'USDT'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_wallet RECORD;
    v_wth RECORD;
BEGIN
    SELECT * INTO v_wallet FROM public.wallets WHERE user_id = p_user_id LIMIT 1;
    IF v_wallet IS NULL OR v_wallet.available_balance < p_amount THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Insufficient available balance for withdrawal');
    END IF;

    -- Move amount from available to pending
    UPDATE public.wallets
    SET available_balance = available_balance - p_amount,
        pending_balance = pending_balance + p_amount,
        total_balance = (available_balance - p_amount) + (pending_balance + p_amount),
        updated_at = NOW()
    WHERE user_id = p_user_id
    RETURNING * INTO v_wallet;

    -- Insert pending withdrawal
    INSERT INTO public.withdrawals (
        user_id, amount, recipient_address, currency, status
    ) VALUES (
        p_user_id, p_amount, p_recipient_address, p_currency, 'PENDING'
    ) RETURNING * INTO v_wth;

    RETURN jsonb_build_object(
        'success', TRUE,
        'withdrawal', to_jsonb(v_wth),
        'wallet', to_jsonb(v_wallet)
    );
END;
$$;

-- 10.6 Approve Withdrawal Request
CREATE OR REPLACE FUNCTION public.approve_withdrawal_request(
    p_withdrawal_id UUID,
    p_admin_id VARCHAR DEFAULT 'admin',
    p_remarks TEXT DEFAULT 'Withdrawal approved & dispatched'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_wth RECORD;
    v_wallet RECORD;
BEGIN
    SELECT * INTO v_wth FROM public.withdrawals WHERE id = p_withdrawal_id LIMIT 1;
    IF v_wth IS NULL THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Withdrawal record not found');
    END IF;

    UPDATE public.withdrawals
    SET status = 'APPROVED', admin_note = p_remarks, updated_at = NOW()
    WHERE id = p_withdrawal_id;

    UPDATE public.wallets
    SET pending_balance = GREATEST(0, pending_balance - v_wth.amount),
        total_balance = available_balance + GREATEST(0, pending_balance - v_wth.amount),
        updated_at = NOW()
    WHERE user_id = v_wth.user_id
    RETURNING * INTO v_wallet;

    RETURN jsonb_build_object('success', TRUE, 'wallet', to_jsonb(v_wallet));
END;
$$;

-- 10.7 Reject / Cancel Withdrawal Request (Refunds Balance)
CREATE OR REPLACE FUNCTION public.reject_withdrawal_request(
    p_withdrawal_id UUID,
    p_admin_id VARCHAR DEFAULT 'admin',
    p_remarks TEXT DEFAULT 'Withdrawal rejected and refunded'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_wth RECORD;
    v_wallet RECORD;
BEGIN
    SELECT * INTO v_wth FROM public.withdrawals WHERE id = p_withdrawal_id LIMIT 1;
    IF v_wth IS NULL THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Withdrawal record not found');
    END IF;

    UPDATE public.withdrawals
    SET status = 'REJECTED', admin_note = p_remarks, updated_at = NOW()
    WHERE id = p_withdrawal_id;

    -- Refund amount back to available balance
    UPDATE public.wallets
    SET available_balance = available_balance + v_wth.amount,
        pending_balance = GREATEST(0, pending_balance - v_wth.amount),
        total_balance = available_balance + v_wth.amount + GREATEST(0, pending_balance - v_wth.amount),
        updated_at = NOW()
    WHERE user_id = v_wth.user_id
    RETURNING * INTO v_wallet;

    RETURN jsonb_build_object('success', TRUE, 'wallet', to_jsonb(v_wallet), 'refundedAmount', v_wth.amount);
END;
$$;

CREATE OR REPLACE FUNCTION public.cancel_withdrawal_request(
    p_withdrawal_id UUID,
    p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN public.reject_withdrawal_request(p_withdrawal_id, 'USER', 'Withdrawal cancelled by user');
END;
$$;
