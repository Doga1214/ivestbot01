import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Sparkles,
  Trophy,
  RotateCw,
  Gift,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  History,
  Zap
} from 'lucide-react';
import { luckySpinService } from '../../services/luckySpinService';
import type { SpinSlice, UserSpinState, SpinResult, RecentWinnerFeedItem } from '../../types/spin';
import { WheelCanvas, type WheelCanvasRef } from './WheelCanvas';
import { ConfettiEffect } from './ConfettiEffect';

interface LuckySpinModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userLevel?: number;
  onRewardClaimed?: () => void;
}

export const LuckySpinModal: React.FC<LuckySpinModalProps> = ({
  isOpen,
  onClose,
  userId,
  userLevel = 1,
  onRewardClaimed
}) => {
  const [slices, setSlices] = useState<SpinSlice[]>([]);
  const [spinState, setSpinState] = useState<UserSpinState | null>(null);
  const [activeTab, setActiveTab] = useState<'wheel' | 'history' | 'rules'>('wheel');
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [spinError, setSpinError] = useState<string | null>(null);
  const [currentWin, setCurrentWin] = useState<SpinResult | null>(null);
  const [showWinDialog, setShowWinDialog] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [countdownStr, setCountdownStr] = useState<string>('');
  const [recentWinners, setRecentWinners] = useState<RecentWinnerFeedItem[]>([]);
  const [historyList, setHistoryList] = useState<SpinResult[]>([]);

  const wheelRef = useRef<WheelCanvasRef | null>(null);

  // Load Initial Data
  const refreshData = () => {
    if (!userId) return;
    const loadedSlices = luckySpinService.getSlices();
    setSlices(loadedSlices);
    const state = luckySpinService.getUserSpinState(userId, userLevel);
    setSpinState(state);
    setRecentWinners(luckySpinService.getRecentWinners());
    setHistoryList(luckySpinService.getUserSpinHistory(userId));
  };

  useEffect(() => {
    if (isOpen && userId) {
      refreshData();
      setShowWinDialog(false);
      setShowConfetti(false);
      setSpinError(null);
    }
  }, [isOpen, userId, userLevel]);

  // Countdown Timer for Next Daily Free Spin
  useEffect(() => {
    if (!spinState?.nextDailySpinAt) {
      setCountdownStr('');
      return;
    }

    const interval = setInterval(() => {
      const diff = new Date(spinState.nextDailySpinAt!).getTime() - Date.now();
      if (diff <= 0) {
        setCountdownStr('Ready!');
        refreshData();
        clearInterval(interval);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdownStr(
          `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [spinState?.nextDailySpinAt]);

  const handleClaimDaily = () => {
    if (!userId) return;
    const updated = luckySpinService.claimDailySpin(userId, userLevel);
    setSpinState(updated);
  };

  const handleStartSpin = async () => {
    if (!userId || isSpinning) return;
    setSpinError(null);

    try {
      // 1. Calculate outcome server/service-side
      const result = await luckySpinService.executeSpin(userId, userLevel);
      setIsSpinning(true);

      // 2. Animate wheel to the winning slice
      wheelRef.current?.spinToSlice(result.sliceIndex, () => {
        setIsSpinning(false);
        setCurrentWin(result);
        setShowWinDialog(true);
        setShowConfetti(true);
        refreshData();
        if (onRewardClaimed) onRewardClaimed();
      });
    } catch (err: unknown) {
      setIsSpinning(false);
      if (err instanceof Error) {
        setSpinError(err.message);
      } else {
        setSpinError('Failed to execute spin. Please try again.');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(3, 7, 18, 0.82)',
        backdropFilter: 'blur(10px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <ConfettiEffect active={showConfetti} onComplete={() => setShowConfetti(false)} />

      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '480px',
          maxHeight: '92vh',
          backgroundColor: '#0F172A',
          border: '1px solid rgba(234, 179, 8, 0.35)',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 35px rgba(234, 179, 8, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header with Title and Close Button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid rgba(51, 65, 85, 0.6)',
            background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(245, 158, 11, 0.4)'
              }}
            >
              <Sparkles size={20} color="#0F172A" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#F8FAFC', letterSpacing: '0.3px' }}>
                LUCKY DRAW WHEEL
              </h3>
              <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 500 }}>
                Spin daily & win up to 100 USDT cash!
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isSpinning}
            style={{
              background: 'rgba(51, 65, 85, 0.5)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94A3B8',
              cursor: isSpinning ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Live Winners Marquee Ticker */}
        <div
          style={{
            backgroundColor: 'rgba(2, 6, 23, 0.6)',
            borderBottom: '1px solid rgba(51, 65, 85, 0.4)',
            padding: '6px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflow: 'hidden',
            fontSize: '11px'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#EAB308', fontWeight: 700 }}>
            <Trophy size={13} /> Live:
          </span>
          <div style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#CBD5E1' }}>
            {recentWinners.length > 0 ? (
              <span>
                🎉 <strong style={{ color: '#38BDF8' }}>{recentWinners[0].username}</strong> won{' '}
                <strong style={{ color: '#22C55E' }}>{recentWinners[0].prizeLabel}</strong> ({recentWinners[0].timeAgo})
              </span>
            ) : (
              'Spin the wheel to become the next top winner!'
            )}
          </div>
        </div>

        {/* Navigation Tab Bar */}
        <div
          style={{
            display: 'flex',
            padding: '8px 16px 0 16px',
            gap: '8px',
            borderBottom: '1px solid rgba(51, 65, 85, 0.4)'
          }}
        >
          <button
            onClick={() => setActiveTab('wheel')}
            style={{
              flex: 1,
              padding: '8px 0',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'wheel' ? '2px solid #EAB308' : '2px solid transparent',
              color: activeTab === 'wheel' ? '#FEF08A' : '#94A3B8',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <RotateCw size={14} /> Wheel
          </button>
          <button
            onClick={() => setActiveTab('history')}
            style={{
              flex: 1,
              padding: '8px 0',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'history' ? '2px solid #EAB308' : '2px solid transparent',
              color: activeTab === 'history' ? '#FEF08A' : '#94A3B8',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <History size={14} /> My Wins ({historyList.length})
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            style={{
              flex: 1,
              padding: '8px 0',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'rules' ? '2px solid #EAB308' : '2px solid transparent',
              color: activeTab === 'rules' ? '#FEF08A' : '#94A3B8',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <HelpCircle size={14} /> Odds & Rules
          </button>
        </div>

        {/* Main Content Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {activeTab === 'wheel' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Active APR Booster Notification banner if active */}
              {spinState && spinState.activeAprBoostPercent > 0 && (
                <div
                  style={{
                    width: '100%',
                    marginBottom: '12px',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(14, 165, 233, 0.15)',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    color: '#38BDF8'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                    <Zap size={15} color="#38BDF8" /> Active Yield Boost: +{spinState.activeAprBoostPercent}% APR
                  </span>
                  <span style={{ fontSize: '10px', color: '#94A3B8' }}>Active 24h</span>
                </div>
              )}

              {/* Error Message */}
              {spinError && (
                <div
                  style={{
                    width: '100%',
                    marginBottom: '12px',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#F87171',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <AlertCircle size={15} />
                  {spinError}
                </div>
              )}

              {/* The Wheel Canvas */}
              <div style={{ margin: '8px 0 16px 0' }}>
                <WheelCanvas
                  ref={wheelRef}
                  slices={slices}
                  size={320}
                  onSpinStart={() => setIsSpinning(true)}
                />
              </div>

              {/* Available Spins Badge & Cooldown */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '10px 16px',
                  borderRadius: '14px',
                  backgroundColor: 'rgba(30, 41, 59, 0.6)',
                  border: '1px solid rgba(51, 65, 85, 0.5)',
                  marginBottom: '14px'
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 500 }}>Available Tickets</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#FEF08A' }}>
                    {spinState?.availableSpins || 0} <span style={{ fontSize: '12px', color: '#CBD5E1' }}>Spins</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 500 }}>Next Free Spin</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: countdownStr ? '#38BDF8' : '#22C55E' }}>
                    {countdownStr ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={13} /> {countdownStr}
                      </span>
                    ) : (
                      'Available Now!'
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button: SPIN or CLAIM DAILY */}
              {spinState && spinState.availableSpins > 0 ? (
                <button
                  onClick={handleStartSpin}
                  disabled={isSpinning}
                  style={{
                    width: '100%',
                    padding: '14px 20px',
                    borderRadius: '14px',
                    border: 'none',
                    background: isSpinning
                      ? 'linear-gradient(135deg, #64748B 0%, #475569 100%)'
                      : 'linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #B45309 100%)',
                    color: isSpinning ? '#CBD5E1' : '#0F172A',
                    fontSize: '16px',
                    fontWeight: 900,
                    letterSpacing: '0.8px',
                    cursor: isSpinning ? 'not-allowed' : 'pointer',
                    boxShadow: isSpinning ? 'none' : '0 10px 25px -5px rgba(245, 158, 11, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                    transform: isSpinning ? 'scale(0.98)' : 'scale(1)'
                  }}
                >
                  <RotateCw size={18} className={isSpinning ? 'spin-anim' : ''} />
                  {isSpinning ? 'SPINNING THE WHEEL...' : 'SPIN THE WHEEL NOW'}
                </button>
              ) : spinState && spinState.canClaimDailySpin ? (
                <button
                  onClick={handleClaimDaily}
                  style={{
                    width: '100%',
                    padding: '14px 20px',
                    borderRadius: '14px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    color: '#FFFFFF',
                    fontSize: '15px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Gift size={18} /> CLAIM TODAY&apos;S FREE SPIN
                </button>
              ) : (
                <div
                  style={{
                    width: '100%',
                    textAlign: 'center',
                    padding: '12px',
                    borderRadius: '14px',
                    backgroundColor: 'rgba(30, 41, 59, 0.5)',
                    border: '1px dashed #475569',
                    fontSize: '12px',
                    color: '#94A3B8'
                  }}
                >
                  No spins remaining. Invite friends through your Referral Link to get +1 ticket per active member!
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                  padding: '10px 14px',
                  backgroundColor: 'rgba(30, 41, 59, 0.5)',
                  borderRadius: '12px',
                  fontSize: '12px'
                }}
              >
                <span style={{ color: '#94A3B8' }}>Total Cash Won:</span>
                <span style={{ color: '#22C55E', fontWeight: 800, fontSize: '15px' }}>
                  +${spinState?.totalWonUsdt?.toFixed(2) || '0.00'} USDT
                </span>
              </div>

              {historyList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 12px', color: '#64748B', fontSize: '13px' }}>
                  <History size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
                  <div>No spin records yet. Give it a spin today!</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {historyList.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        padding: '10px 14px',
                        backgroundColor: 'rgba(30, 41, 59, 0.7)',
                        border: '1px solid rgba(51, 65, 85, 0.6)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            backgroundColor: item.prizeType === 'USDT' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Gift size={16} color={item.prizeType === 'USDT' ? '#22C55E' : '#38BDF8'} />
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC' }}>
                            {item.prizeText}
                          </div>
                          <div style={{ fontSize: '10px', color: '#64748B' }}>
                            {new Date(item.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          color: item.prizeType === 'USDT' ? '#22C55E' : '#EAB308'
                        }}
                      >
                        {item.prizeType === 'USDT' ? `+$${item.prizeValue.toFixed(2)}` : 'Claimed'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'rules' && (
            <div style={{ fontSize: '12px', color: '#CBD5E1', lineHeight: '1.6' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#FEF08A', fontSize: '14px' }}>🎡 Lucky Draw Probability Table</h4>
              <div
                style={{
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  marginBottom: '16px'
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '11.5px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#1E293B', color: '#94A3B8' }}>
                      <th style={{ padding: '8px 12px' }}>Prize</th>
                      <th style={{ padding: '8px 12px' }}>Type</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>Win Probability</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slices.map((s) => (
                      <tr key={s.id} style={{ borderBottom: '1px solid #1E293B' }}>
                        <td style={{ padding: '8px 12px', fontWeight: 600, color: s.accentColor }}>{s.label}</td>
                        <td style={{ padding: '8px 12px', color: '#94A3B8' }}>{s.prizeType}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#F8FAFC' }}>
                          {s.probabilityPercent}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h4 style={{ margin: '0 0 6px 0', color: '#FEF08A', fontSize: '13px' }}>📜 Fair Play Rules</h4>
              <ul style={{ paddingLeft: '18px', margin: 0, color: '#94A3B8', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li>Every registered member receives 1 free spin every 24 hours.</li>
                <li>VIP Level 2+ members receive extra daily allowances (Up to 5 spins/day).</li>
                <li>USDT prizes are credited directly and instantaneously to your main balance ledger.</li>
                <li>Outcome generation is server-authoritative and mathematically fair.</li>
              </ul>
            </div>
          )}
        </div>

        {/* Win Reveal Dialog Overlay */}
        {showWinDialog && currentWin && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              textAlign: 'center',
              zIndex: 20
            }}
          >
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: currentWin.slice.isJackpot
                  ? 'linear-gradient(135deg, #FDE047 0%, #D97706 100%)'
                  : 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 35px rgba(245, 158, 11, 0.6)',
                marginBottom: '16px'
              }}
            >
              {currentWin.slice.isJackpot ? (
                <Trophy size={36} color="#0F172A" />
              ) : (
                <CheckCircle2 size={36} color="#FFFFFF" />
              )}
            </div>

            <div style={{ fontSize: '13px', fontWeight: 700, color: '#FBBF24', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {currentWin.slice.isJackpot ? '🌟 MEGA JACKPOT UNLOCKED! 🌟' : 'CONGRATULATIONS!'}
            </div>

            <div
              style={{
                fontSize: '28px',
                fontWeight: 900,
                color: '#F8FAFC',
                margin: '8px 0 4px 0',
                letterSpacing: '0.5px'
              }}
            >
              {currentWin.prizeText}
            </div>

            <div style={{ fontSize: '13px', color: '#94A3B8', maxWidth: '300px', marginBottom: '24px' }}>
              {currentWin.prizeType === 'USDT'
                ? 'Your winnings have been credited directly to your live wallet balance.'
                : currentWin.prizeType === 'APR_BOOST'
                ? 'Your +0.5% APR boost is active on all pool reservations for the next 24 hours!'
                : 'Extra spin ticket added to your balance! Spin again!'}
            </div>

            <button
              onClick={() => {
                setShowWinDialog(false);
                setShowConfetti(false);
              }}
              style={{
                width: '100%',
                maxWidth: '260px',
                padding: '12px 20px',
                borderRadius: '14px',
                border: 'none',
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                color: '#0F172A',
                fontSize: '15px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(245, 158, 11, 0.4)'
              }}
            >
              AWESOME, CONTINUE
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
