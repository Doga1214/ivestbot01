import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import type { SpinSlice } from '../../types/spin';

export interface WheelCanvasRef {
  spinToSlice: (sliceIndex: number, onComplete: () => void) => void;
  isSpinning: boolean;
}

interface WheelCanvasProps {
  slices: SpinSlice[];
  size?: number;
  onSpinStart?: () => void;
  isHighRollerMode?: boolean;
}

// Web Audio API Synthesizer for mechanical ticks & win chime
const playMechanicalTick = () => {
  try {
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.03);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.03);
  } catch {
    // AudioContext blocked or not supported
  }
};

export const playWinFanfare = (isJackpot: boolean = false) => {
  try {
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const notes = isJackpot ? [523.25, 659.25, 783.99, 1046.50, 1318.51] : [440, 554.37, 659.25, 880];
    
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.1);

      gain.gain.setValueAtTime(0, ctx.currentTime + index * 0.1);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + index * 0.1 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.1 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + index * 0.1);
      osc.stop(ctx.currentTime + index * 0.1 + 0.4);
    });
  } catch {
    // ignore
  }
};

export const WheelCanvas = forwardRef<WheelCanvasRef, WheelCanvasProps>(({
  slices,
  size = 360,
  onSpinStart,
  isHighRollerMode = false
}, ref) => {
  const [rotation, setRotation] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [activeLed, setActiveLed] = useState<number>(0);
  const rotationRef = useRef<number>(0);
  const isSpinningRef = useRef<boolean>(false);
  const lastTickAngleRef = useRef<number>(0);
  const animRef = useRef<number | null>(null);

  const numSlices = slices.length || 8;
  const sliceAngle = 360 / numSlices;
  const radius = size / 2;
  const center = radius;

  // Keep refs synced
  rotationRef.current = rotation;
  isSpinningRef.current = isSpinning;

  // LED lights blinking animation around the rim
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveLed((prev) => (prev + 1) % 16);
    }, isSpinning ? 50 : 350);
    return () => clearInterval(interval);
  }, [isSpinning]);

  useImperativeHandle(ref, () => ({
    get isSpinning() {
      return isSpinningRef.current;
    },
    spinToSlice: (targetSliceIndex: number, onComplete: () => void) => {
      if (isSpinningRef.current) return;
      setIsSpinning(true);
      isSpinningRef.current = true;
      if (onSpinStart) onSpinStart();

      // Physics Calculation:
      // Slice idx center is at (idx + 0.5) * sliceAngle - 90 deg.
      // Top pointer is at -90 deg.
      // Target rotation angle mod 360 to align slice center with top pointer:
      const sliceCenter = (targetSliceIndex + 0.5) * sliceAngle;
      // Slight organic jitter (+/- 25% of half-slice width)
      const jitter = (Math.random() - 0.5) * (sliceAngle * 0.35);
      const targetAngleIn360 = (360 - sliceCenter + jitter + 360) % 360;

      const currentRot = rotationRef.current;
      const currentAngleIn360 = ((currentRot % 360) + 360) % 360;

      // Distance clockwise to reach target angle
      const forwardDistance = (targetAngleIn360 - currentAngleIn360 + 360) % 360;
      const fullRotations = 5 + Math.floor(Math.random() * 2); // 5 to 6 full 360° spins
      const totalDelta = (fullRotations * 360) + forwardDistance;
      const finalRotation = currentRot + totalDelta;

      const durationMs = 3800; // Snappy, exciting 3.8s spin
      const startTime = performance.now();
      lastTickAngleRef.current = currentRot;

      const easeOutCubic = (t: number) => {
        return 1 - Math.pow(1 - t, 3.8);
      };

      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / durationMs);
        const easedProgress = easeOutCubic(progress);
        const currentAnimRot = currentRot + totalDelta * easedProgress;

        rotationRef.current = currentAnimRot;
        setRotation(currentAnimRot);

        // Sound ticker check
        if (Math.abs(currentAnimRot - lastTickAngleRef.current) >= (sliceAngle / 1.6)) {
          playMechanicalTick();
          lastTickAngleRef.current = currentAnimRot;
        }

        if (progress < 1) {
          animRef.current = requestAnimationFrame(animate);
        } else {
          rotationRef.current = finalRotation;
          setRotation(finalRotation);
          setIsSpinning(false);
          isSpinningRef.current = false;
          
          const targetSlice = slices[targetSliceIndex];
          const isLoss = targetSlice?.prizeType === 'LOSS' || targetSlice?.prizeType === 'TRY_AGAIN';
          if (!isLoss) {
            playWinFanfare(targetSlice?.isJackpot);
          }
          onComplete();
        }
      };

      animRef.current = requestAnimationFrame(animate);
    }
  }));


  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  // Generate SVG path for a circular pie slice
  const getSlicePath = (index: number) => {
    const startAngleRad = ((index * sliceAngle - 90) * Math.PI) / 180;
    const endAngleRad = (((index + 1) * sliceAngle - 90) * Math.PI) / 180;
    const innerRadius = 28;
    const outerRadius = radius - 18;

    const x1 = center + outerRadius * Math.cos(startAngleRad);
    const y1 = center + outerRadius * Math.sin(startAngleRad);
    const x2 = center + outerRadius * Math.cos(endAngleRad);
    const y2 = center + outerRadius * Math.sin(endAngleRad);

    const x3 = center + innerRadius * Math.cos(endAngleRad);
    const y3 = center + innerRadius * Math.sin(endAngleRad);
    const x4 = center + innerRadius * Math.cos(startAngleRad);
    const y4 = center + innerRadius * Math.sin(startAngleRad);

    return `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 0 0 ${x4} ${y4} Z`;
  };

  const ledCount = 16;
  const leds = Array.from({ length: ledCount }).map((_, i) => {
    const angle = ((i * (360 / ledCount) - 90) * Math.PI) / 180;
    const ledRadius = radius - 9;
    return {
      x: center + ledRadius * Math.cos(angle),
      y: center + ledRadius * Math.sin(angle),
      isActive: (i % 2 === activeLed % 2)
    };
  });

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto', userSelect: 'none' }}>
      {/* Outer Glow Halo */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          boxShadow: isHighRollerMode
            ? '0 0 55px rgba(239, 68, 68, 0.75), inset 0 0 30px rgba(245, 158, 11, 0.55)'
            : '0 0 45px rgba(234, 179, 8, 0.25), inset 0 0 25px rgba(59, 130, 246, 0.2)',
          transition: 'box-shadow 0.4s ease',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />

      {/* Rotating SVG Wheel */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{
          transform: `rotate(${rotation}deg)`,
          transformOrigin: '50% 50%',
          display: 'block'
        }}
      >
        <defs>
          <radialGradient id="outerRimGrad" cx="50%" cy="50%" r="50%">
            <stop offset="85%" stopColor="#1E293B" />
            <stop offset="95%" stopColor="#EAB308" />
            <stop offset="100%" stopColor="#CA8A04" />
          </radialGradient>
          <linearGradient id="goldTrim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="50%" stopColor="#EAB308" />
            <stop offset="100%" stopColor="#854D0E" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Rim Plate */}
        <circle cx={center} cy={center} r={radius - 2} fill="#0F172A" stroke="url(#goldTrim)" strokeWidth="6" />

        {/* Individual Slices */}
        {slices.map((slice, idx) => {
          const midAngle = (idx + 0.5) * sliceAngle - 90;
          const textRad = (midAngle * Math.PI) / 180;
          const textDistance = radius * 0.65;
          const textX = center + textDistance * Math.cos(textRad);
          const textY = center + textDistance * Math.sin(textRad);

          return (
            <g key={slice.id || idx}>
              <path
                d={getSlicePath(idx)}
                fill={slice.isJackpot ? 'url(#goldTrim)' : (idx % 2 === 0 ? '#1E293B' : '#111827')}
                stroke={slice.isJackpot ? '#FEF08A' : '#334155'}
                strokeWidth="1.5"
              />
              <g
                transform={`translate(${textX}, ${textY}) rotate(${midAngle + 90})`}
                style={{ pointerEvents: 'none' }}
              >
                <text
                  x="0"
                  y="-10"
                  textAnchor="middle"
                  fill={slice.isJackpot ? '#0F172A' : (slice.accentColor || '#F8FAFC')}
                  fontSize={slice.label.length > 8 ? "11.5" : "13"}
                  fontWeight="800"
                  letterSpacing="0.3px"
                >
                  {slice.label}
                </text>
                {slice.sublabel && (
                  <text
                    x="0"
                    y="5"
                    textAnchor="middle"
                    fill={slice.isJackpot ? '#78350F' : '#94A3B8'}
                    fontSize="9"
                    fontWeight="600"
                  >
                    {slice.sublabel}
                  </text>
                )}
              </g>
            </g>
          );
        })}

        {/* Slice Dividers Pin Lines */}
        {slices.map((_, idx) => {
          const angle = ((idx * sliceAngle - 90) * Math.PI) / 180;
          const x1 = center + 28 * Math.cos(angle);
          const y1 = center + 28 * Math.sin(angle);
          const x2 = center + (radius - 18) * Math.cos(angle);
          const y2 = center + (radius - 18) * Math.sin(angle);
          return (
            <line
              key={`div-${idx}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#475569"
              strokeWidth="1.5"
              strokeDasharray="2,2"
            />
          );
        })}

        {/* Outer Rim LEDs */}
        {leds.map((led, i) => (
          <circle
            key={`led-${i}`}
            cx={led.x}
            cy={led.y}
            r={isHighRollerMode ? "4" : "3.5"}
            fill={led.isActive ? (isHighRollerMode ? '#EF4444' : '#FDE047') : (isHighRollerMode ? '#7F1D1D' : '#475569')}
            filter={led.isActive ? 'url(#glow)' : undefined}
          />
        ))}

        {/* Center Golden Hub */}
        <circle cx={center} cy={center} r="32" fill="#0F172A" stroke="url(#goldTrim)" strokeWidth="4" />
        <circle cx={center} cy={center} r="22" fill="url(#goldTrim)" />
        <circle cx={center} cy={center} r="14" fill="#0F172A" />
        <text
          x={center}
          y={center + 4}
          textAnchor="middle"
          fill="#FDE047"
          fontSize="10"
          fontWeight="900"
          letterSpacing="0.5px"
        >
          IVEST
        </text>
      </svg>

      {/* Top Precision Indicator Needle / Pointer */}
      <div
        style={{
          position: 'absolute',
          top: -12,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '14px solid transparent',
          borderRight: '14px solid transparent',
          borderTop: '28px solid #EF4444',
          filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.6))',
          zIndex: 10
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -26,
            left: -5,
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: '#FDE047',
            boxShadow: '0 0 8px #FDE047'
          }}
        />
      </div>
    </div>
  );
});

WheelCanvas.displayName = 'WheelCanvas';
