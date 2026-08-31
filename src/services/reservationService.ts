import { WALLET_CONFIG } from '../config/walletConfig';
import { walletService } from './walletService';

export interface ReservationRecord {
  id: string;
  amount: number;
  dailyRate: number; // 2.58%
  effectiveRate: number; // Rate earned based on duration
  activeDurationSeconds: number;
  profit: number;
  status: 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  startedAt: string;
  completedAt?: string;
  referenceId: string;
  isFullCycle: boolean;
  type?: 'RESERVATION' | 'AI_MINING';
}

export interface PreparedReservation {
  amount: number;
  dailyRate: number;
  effectiveRate: number;
  activeDurationSeconds: number;
  profit: number;
  isFullCycle: boolean;
  preparedAt: string;
}

export interface ReservationState {
  isMining: boolean;
  miningStartedAt: number | null; // Timestamp in ms
  miningAmount: number;
  preparedReservation: PreparedReservation | null; // Calculated yield waiting for user confirmation
  currentProcessing: ReservationRecord | null; // 20s processing window
  lastCompletedReservation: ReservationRecord | null;
  nextAvailableTimestamp: number | null; // Strict 24-hour cooldown lock timestamp in ms
}

const RESERVATION_STORAGE_KEY = 'ivestbot_reservation_state_v2';
const HISTORY_STORAGE_KEY = 'ivestbot_reservation_history_v2';
const MAX_CYCLE_SECONDS = WALLET_CONFIG.reservationLockHours * 3600; // 86,400 seconds = 24 hours

const DEFAULT_HISTORY: ReservationRecord[] = [
  {
    id: 'res-8812',
    amount: 100.0,
    dailyRate: WALLET_CONFIG.defaultDailyRate,
    effectiveRate: WALLET_CONFIG.defaultDailyRate,
    activeDurationSeconds: 86400,
    profit: Number((100.0 * (WALLET_CONFIG.defaultDailyRate / 100)).toFixed(4)),
    status: 'COMPLETED',
    startedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    completedAt: new Date(Date.now() - 86400000 * 2 + 20000).toISOString(),
    referenceId: 'RES-8812-FULL',
    isFullCycle: true,
    type: 'AI_MINING'
  }
];

export const reservationService = {
  getReservationState(): ReservationState {
    try {
      const stored = localStorage.getItem(RESERVATION_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return {
      isMining: false,
      miningStartedAt: null,
      miningAmount: 0,
      preparedReservation: null,
      currentProcessing: null,
      lastCompletedReservation: DEFAULT_HISTORY[0],
      nextAvailableTimestamp: null
    };
  },

  saveReservationState(state: ReservationState): void {
    localStorage.setItem(RESERVATION_STORAGE_KEY, JSON.stringify(state));
  },

  getHistory(): ReservationRecord[] {
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return DEFAULT_HISTORY;
  },

  saveHistory(history: ReservationRecord[]): void {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  },

  /**
   * Checks strict 24-hour cycle lock eligibility.
   */
  getCycleLockStatus(): { isLocked: boolean; secondsRemaining: number } {
    const state = this.getReservationState();
    const now = Date.now();

    if (state.nextAvailableTimestamp && now < state.nextAvailableTimestamp) {
      const secondsRemaining = Math.ceil((state.nextAvailableTimestamp - now) / 1000);
      return { isLocked: true, secondsRemaining };
    }
    return { isLocked: false, secondsRemaining: 0 };
  },

  /**
   * Calculates live accumulated pro-rata yield based on active elapsed time.
   */
  calculateProRataYield(
    amount: number,
    elapsedSeconds: number,
    baseDailyRate: number = WALLET_CONFIG.defaultDailyRate
  ): {
    elapsedSeconds: number;
    effectiveRate: number;
    profit: number;
    progressPercent: number;
    is24hComplete: boolean;
  } {
    const clampedSeconds = Math.max(0, Math.min(elapsedSeconds, MAX_CYCLE_SECONDS));
    const ratio = clampedSeconds / MAX_CYCLE_SECONDS;
    const effectiveRate = Number((baseDailyRate * ratio).toFixed(4));
    const profit = Number((amount * (effectiveRate / 100)).toFixed(4));
    const progressPercent = Number((ratio * 100).toFixed(2));
    const is24hComplete = elapsedSeconds >= MAX_CYCLE_SECONDS;

    return {
      elapsedSeconds: clampedSeconds,
      effectiveRate,
      profit,
      progressPercent,
      is24hComplete
    };
  },

  /**
   * 1. Start 24H AI Mining (1 time per 24 hours).
   */
  startMining(amount: number): { success: boolean; message: string } {
    const lock = this.getCycleLockStatus();
    if (lock.isLocked) {
      return {
        success: false,
        message: `24-Hour cycle is currently locked. Next cycle available in ${Math.floor(lock.secondsRemaining / 3600)}h ${Math.floor((lock.secondsRemaining % 3600) / 60)}m.`
      };
    }

    const state = this.getReservationState();
    if (state.isMining) {
      return { success: false, message: 'Mining is already active.' };
    }

    state.isMining = true;
    state.miningStartedAt = Date.now();
    state.miningAmount = amount;
    state.preparedReservation = null;
    this.saveReservationState(state);

    return { success: true, message: `24H Star AI Mining Bot activated with ${amount.toFixed(2)} USDT!` };
  },

  /**
   * 2. Stop Mining & Prepare Pro-Rata Yield (Calculates yield based on duration, but leaves reservation execution to the user).
   */
  stopMiningAndPrepareReservation(elapsedSeconds: number): PreparedReservation {
    const state = this.getReservationState();
    const amount = state.miningAmount || walletService.getWallet().availableBalance;
    const calc = this.calculateProRataYield(amount, elapsedSeconds);

    const prepared: PreparedReservation = {
      amount,
      dailyRate: WALLET_CONFIG.defaultDailyRate,
      effectiveRate: calc.effectiveRate,
      activeDurationSeconds: calc.elapsedSeconds,
      profit: calc.profit,
      isFullCycle: calc.is24hComplete,
      preparedAt: new Date().toISOString()
    };

    state.isMining = false;
    state.miningStartedAt = null;
    state.preparedReservation = prepared;
    this.saveReservationState(state);

    return prepared;
  },

  /**
   * 3. Start 20s Settlement Execution when User clicks "EXECUTE RESERVATION".
   */
  initiateSettlementExecution(prepared?: PreparedReservation): ReservationRecord {
    const state = this.getReservationState();
    const data = prepared || state.preparedReservation || {
      amount: walletService.getWallet().availableBalance,
      dailyRate: WALLET_CONFIG.defaultDailyRate,
      effectiveRate: WALLET_CONFIG.defaultDailyRate,
      activeDurationSeconds: 86400,
      profit: Number((walletService.getWallet().availableBalance * (WALLET_CONFIG.defaultDailyRate / 100)).toFixed(4)),
      isFullCycle: true,
      preparedAt: new Date().toISOString()
    };

    const record: ReservationRecord = {
      id: `res-${Date.now().toString().slice(-4)}`,
      amount: data.amount,
      dailyRate: WALLET_CONFIG.defaultDailyRate,
      effectiveRate: data.effectiveRate,
      activeDurationSeconds: data.activeDurationSeconds,
      profit: data.profit,
      status: 'PROCESSING',
      startedAt: data.preparedAt || new Date().toISOString(),
      referenceId: data.isFullCycle ? `MIN-${Date.now().toString().slice(-5)}-FULL` : `MIN-${Date.now().toString().slice(-5)}-PRO`,
      isFullCycle: data.isFullCycle,
      type: 'AI_MINING'
    };

    state.currentProcessing = record;
    this.saveReservationState(state);

    return record;
  },

  /**
   * 4. Finalize Settlement after 20s & enforce strict 24-hour lock countdown.
   */
  finalizeSettlement(record: ReservationRecord): {
    updatedWallet: ReturnType<typeof walletService.getWallet>;
    completedRecord: ReservationRecord;
  } {
    const completedRecord: ReservationRecord = {
      ...record,
      status: 'COMPLETED',
      completedAt: new Date().toISOString()
    };

    // Credit calculated profit to wallet
    const wallet = walletService.getWallet();
    const updatedWallet = {
      ...wallet,
      totalBalance: Number((wallet.totalBalance + completedRecord.profit).toFixed(4)),
      availableBalance: Number((wallet.availableBalance + completedRecord.profit).toFixed(4))
    };
    walletService.saveWallet(updatedWallet);

    const durationText = completedRecord.isFullCycle
      ? '24h Full Cycle'
      : `${Math.floor(completedRecord.activeDurationSeconds / 3600)}h ${Math.floor((completedRecord.activeDurationSeconds % 3600) / 60)}m Active Duration`;

    // Log to immutable transaction ledger
    walletService.addTransaction({
      type: 'DAILY_PROFIT',
      amount: completedRecord.profit,
      currency: 'USDT',
      status: 'COMPLETED',
      description: `Reservation & AI Mining Settlement (${completedRecord.effectiveRate}% for ${durationText})`,
      referenceId: completedRecord.referenceId
    });

    // Enforce STRICT 24-Hour Lock Countdown (86,400 seconds)
    const nextAvailableTimestamp = Date.now() + WALLET_CONFIG.reservationLockHours * 3600 * 1000;

    const state: ReservationState = {
      isMining: false,
      miningStartedAt: null,
      miningAmount: 0,
      preparedReservation: null,
      currentProcessing: null,
      lastCompletedReservation: completedRecord,
      nextAvailableTimestamp
    };
    this.saveReservationState(state);

    // Save to history ledger
    const history = this.getHistory();
    this.saveHistory([completedRecord, ...history]);

    return { updatedWallet, completedRecord };
  },

  /**
   * Admin Tool: Instantly unlocks the 24-hour cycle lock for user
   */
  resetCycleCooldown(): ReservationState {
    const current = this.getReservationState();
    const updated: ReservationState = {
      ...current,
      nextAvailableTimestamp: null,
      isMining: false,
      miningStartedAt: null,
      preparedReservation: null,
      currentProcessing: null
    };
    this.saveReservationState(updated);
    return updated;
  }
};
