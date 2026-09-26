import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { luckySpinService } from '../../services/luckySpinService';
import { LuckySpinModal } from '../spin/LuckySpinModal';
import { useApp } from '../../context/AppContext';

export const FloatingSpinLauncher: React.FC = () => {
  const { user } = useApp();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [availableSpins, setAvailableSpins] = useState<number>(0);
  const [canClaimDaily, setCanClaimDaily] = useState<boolean>(false);

  const checkStatus = () => {
    if (!user?.id) return;
    const state = luckySpinService.getUserSpinState(user.id);
    setAvailableSpins(state.availableSpins);
    setCanClaimDaily(state.canClaimDailySpin);
  };

  useEffect(() => {
    if (user?.id) {
      checkStatus();
      const interval = setInterval(checkStatus, 10000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  if (!user?.id) return null;

  const hasRewardToClaim = availableSpins > 0 || canClaimDaily;

  return (
    <>
      <div
        style={{
          position: 'fixed',
          bottom: '84px',
          right: '20px',
          zIndex: 900
        }}
      >
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #92400E 100%)',
            border: '2px solid #FEF08A',
            color: '#0F172A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 8px 25px rgba(245, 158, 11, 0.45), 0 0 15px rgba(254, 240, 138, 0.3)',
            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            position: 'relative'
          }}
          title="Lucky Spin Wheel"
        >
          <Sparkles size={26} color="#0F172A" />

          {/* Badge indicator */}
          {hasRewardToClaim && (
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: '#EF4444',
                color: '#FFFFFF',
                fontSize: '10px',
                fontWeight: 800,
                padding: '2px 6px',
                borderRadius: '10px',
                border: '1.5px solid #0F172A',
                boxShadow: '0 2px 5px rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                gap: '2px'
              }}
            >
              {canClaimDaily && availableSpins === 0 ? 'FREE' : availableSpins}
            </span>
          )}
        </button>
      </div>

      <LuckySpinModal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          checkStatus();
        }}
        userId={user.id}
        onRewardClaimed={checkStatus}
      />
    </>
  );
};
