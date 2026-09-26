import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  RotateCcw,
  Sparkles,
  Gift,
  AlertCircle,
  CheckCircle2,
  Users,
  Percent,
  Plus
} from 'lucide-react';
import { luckySpinService, DEFAULT_SPIN_SLICES } from '../../services/luckySpinService';
import type { SpinSlice, SpinAdminConfig } from '../../types/spin';

export const AdminSpinWheelManager: React.FC = () => {
  const [slices, setSlices] = useState<SpinSlice[]>([]);
  const [config, setConfig] = useState<SpinAdminConfig | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Manual Grant State
  const [targetUserId, setTargetUserId] = useState<string>('');
  const [grantSpinsCount, setGrantSpinsCount] = useState<number>(3);
  const [grantSuccess, setGrantSuccess] = useState<string | null>(null);

  useEffect(() => {
    setSlices(luckySpinService.getSlices());
    setConfig(luckySpinService.getAdminConfig());
  }, []);

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

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles color="#F59E0B" size={22} /> Lucky Spin Wheel Administration
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#94A3B8' }}>
            Configure slice rewards, mathematical probability weights, and grant bonus spins.
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

      {/* Slice Probability Editor Table */}
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
                    <option value="USDT">USDT Cash</option>
                    <option value="APR_BOOST">APR Boost</option>
                    <option value="EXTRA_SPIN">Extra Spin</option>
                    <option value="TRY_AGAIN">Try Again</option>
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

      {/* Global Wheel Rules & VIP Configuration */}
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
              <Settings size={16} /> Daily VIP Spin Allowances & Referral Perks
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
              <label style={{ fontSize: '11px', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>
                Level 1 Free Daily Spins
              </label>
              <input
                type="number"
                value={config.dailyFreeSpinsPerLevel.level1}
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
                value={config.dailyFreeSpinsPerLevel.level2}
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
                value={config.dailyFreeSpinsPerLevel.level3}
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
                value={config.dailyFreeSpinsPerLevel.level4}
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

      {/* Manual Spin Airdrop / Grant Tool */}
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
