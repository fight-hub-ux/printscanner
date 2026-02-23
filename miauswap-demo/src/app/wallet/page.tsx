'use client';

import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  Copy,
  Power,
  Shield,
  Lock,
  Unlock,
  TrendingUp,
  TrendingDown,
  Calculator,
  Flame,
  Coins,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  ChevronRight,
  Settings,
} from 'lucide-react';
import {
  walletTransactions,
  miauTokenStats,
  generatePriceData,
} from '@/lib/dummyData';
import { useApp } from '@/context/AppContext';

/* ───────────────────────────────────────────
   Staking tier definitions
   ─────────────────────────────────────────── */
const stakingTiers = [
  {
    name: 'Bronze',
    minStake: 10000,
    lockDays: 30,
    feeDiscount: 0,
    multiplier: '1.0x',
  },
  {
    name: 'Silver',
    minStake: 50000,
    lockDays: 90,
    feeDiscount: 10,
    multiplier: '1.5x',
  },
  {
    name: 'Gold',
    minStake: 250000,
    lockDays: 365,
    feeDiscount: 20,
    multiplier: '2.5x',
  },
] as const;

/* ───────────────────────────────────────────
   Transaction type badge colour helper
   ─────────────────────────────────────────── */
function txTypeBadge(type: string) {
  switch (type) {
    case 'Buy':
      return 'bg-miau-pink/15 text-miau-pink';
    case 'Sell':
      return 'bg-miau-error/10 text-miau-error';
    case 'Distribution Received':
      return 'bg-miau-success/10 text-miau-success';
    case 'Staking Deposit':
      return 'bg-blue-900/30 text-blue-400';
    case 'USDC Staking Reward':
      return 'bg-purple-900/30 text-purple-400';
    default:
      return 'bg-miau-dark-surface text-white';
  }
}

/* ═══════════════════════════════════════════
   WALLET & MIAU BALANCE PAGE
   ═══════════════════════════════════════════ */
export default function WalletPage() {
  const {
    walletAddress,
    miauBalance,
    setMiauBalance,
    stakedAmount,
    setStakedAmount,
    stakingTier,
    feeDiscount,
    isVIP,
    hasCDEXAccess,
    showToast,
    showAccessWarning,
    setShowAccessWarning,
  } = useApp();

  /* ── Staking Modal state ─────────────────── */
  const [showStakeModal, setShowStakeModal] = useState(false);
  const [stakeAmount, setStakeAmount] = useState('');
  const [stakeLockPeriod, setStakeLockPeriod] = useState<30 | 90 | 365>(90);

  /* ── Unstake Modal state ─────────────────── */
  const [showUnstakeModal, setShowUnstakeModal] = useState(false);

  /* ── Fee Calculator state ────────────────── */
  const [tradeSize, setTradeSize] = useState('1000');

  /* ── Price chart data (7-day) ────────────── */
  const priceChartData = useMemo(
    () => generatePriceData(miauTokenStats.price, 7, 0.03),
    [],
  );

  /* ── Derived values ──────────────────────── */
  const totalMiau = miauBalance + stakedAmount;
  const parsedStakeAmount = parseFloat(stakeAmount) || 0;
  const parsedTradeSize = parseFloat(tradeSize) || 0;
  const standardFeeRate = 0.0025;
  const discountedFeeRate = standardFeeRate * (1 - feeDiscount / 100);
  const standardFee = parsedTradeSize * standardFeeRate;
  const discountedFee = parsedTradeSize * discountedFeeRate;
  const feeSaving = standardFee - discountedFee;

  /* Preview what tier the new staked amount would unlock */
  const previewStakedTotal = stakedAmount + parsedStakeAmount;
  const previewTier =
    previewStakedTotal >= 250000
      ? 'Gold'
      : previewStakedTotal >= 50000
        ? 'Silver'
        : previewStakedTotal >= 10000
          ? 'Bronze'
          : 'None';

  /* Estimated monthly USDC rewards (rough: ~5% APY on staked amount at $1/MIAU) */
  const estimatedMonthlyRewards = (previewStakedTotal * 0.05) / 12;

  /* Lock expiry date: always Apr 26, 2026 for demo */
  const lockExpiryDate = 'Apr 26, 2026';
  const lockActive = true; // Demo: lock is always active

  /* ── Stake handler ───────────────────────── */
  const handleStake = () => {
    if (parsedStakeAmount <= 0) return;
    if (parsedStakeAmount > miauBalance) {
      showToast('Insufficient MIAU balance for staking.');
      return;
    }
    setMiauBalance(Math.round((miauBalance - parsedStakeAmount) * 100) / 100);
    setStakedAmount(Math.round((stakedAmount + parsedStakeAmount) * 100) / 100);
    showToast(
      `Successfully staked ${parsedStakeAmount.toLocaleString()} MIAU for ${stakeLockPeriod} days.`,
    );
    setStakeAmount('');
    setShowStakeModal(false);
  };

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */
  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 lg:pb-6">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl lg:text-3xl font-extrabold text-white">
          Wallet
        </h1>
        <p className="text-sm text-miau-muted">
          Your tokens, staking, and wallet info -- all in one place.
        </p>
      </div>

      {/* ═══════════════════════════════════════
         1. WALLET CONNECTION PANEL
         ═══════════════════════════════════════ */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-miau-dark-border flex items-center gap-2">
          <Wallet size={18} className="text-miau-pink" />
          <h2 className="font-bold text-white">Wallet Connection</h2>
        </div>
        <div className="p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Connection info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-miau-success animate-pulse-soft" />
                <span className="text-sm font-medium text-white">Connected</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm text-white bg-miau-dark-surface px-3 py-1.5 rounded-xl">
                  {walletAddress}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(walletAddress);
                    showToast('Address copied');
                  }}
                  className="p-2 rounded-lg hover:bg-miau-dark-hover transition-colors text-miau-muted hover:text-miau-pink"
                  title="Copy Address"
                >
                  <Copy size={16} />
                </button>
              </div>
              <p className="text-xs text-miau-muted">
                Network: <span className="font-medium text-white">Base (Mainnet)</span>
              </p>
            </div>

            {/* Disconnect button */}
            <button
              onClick={() => showToast('Disconnect requested. In a live app, this would disconnect your wallet.')}
              className="flex items-center gap-2 px-4 py-2.5 bg-miau-dark-surface border border-miau-dark-border rounded-xl text-xs font-semibold text-miau-muted hover:bg-miau-error/10 hover:text-miau-error hover:border-miau-error/30 transition-colors"
            >
              <Power size={14} />
              Disconnect
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════
         2. MIAU TOKEN BALANCE CARD
         ═══════════════════════════════════════ */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-miau-dark-border/60 flex items-center gap-2">
          <Coins size={18} className="text-miau-pink" />
          <h2 className="font-bold text-white">MIAU Token Balance</h2>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Wallet Balance */}
            <div className="bg-miau-dark-surface/70 rounded-xl p-4">
              <p className="text-xs text-miau-muted mb-1">Wallet Balance</p>
              <p className="text-2xl font-bold text-white font-mono">
                {miauBalance.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-xs text-miau-muted/60 mt-1">MIAU</p>
            </div>

            {/* Staked Amount */}
            <div className="bg-miau-dark-surface/70 rounded-xl p-4">
              <p className="text-xs text-miau-muted mb-1">Staked Amount</p>
              <p className="text-2xl font-bold text-white font-mono">
                {stakedAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-xs text-miau-muted/60 mt-1">MIAU ({stakingTier} Tier)</p>
            </div>

            {/* Total */}
            <div className="bg-miau-dark-surface/70 rounded-xl p-4">
              <p className="text-xs text-miau-muted mb-1">Total MIAU</p>
              <p className="text-2xl font-bold text-white font-mono">
                {totalMiau.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-xs text-miau-muted/60 mt-1">
                ${totalMiau.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
              </p>
            </div>

            {/* Access Status */}
            <div className="bg-miau-dark-surface/70 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-miau-muted">CDEX Access</p>
                {hasCDEXAccess ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-miau-success">
                    <CheckCircle2 size={12} />
                    Active
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-semibold text-miau-error">
                    <AlertTriangle size={12} />
                    Inactive
                  </span>
                )}
              </div>
              <p className="text-[10px] text-miau-muted/60">
                Hold 1,000+ MIAU to unlock
              </p>
              <div className="flex items-center justify-between">
                <p className="text-xs text-miau-muted">VIP Access</p>
                {isVIP ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-miau-success">
                    <CheckCircle2 size={12} />
                    Active
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-semibold text-miau-muted/60">
                    <Lock size={12} />
                    Locked
                  </span>
                )}
              </div>
              <p className="text-[10px] text-miau-muted/60">
                Stake 25,000+ MIAU to unlock (you have {stakedAmount.toLocaleString()})
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════
         3. STAKING TIERS PANEL
         ═══════════════════════════════════════ */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-miau-dark-border flex items-center gap-2">
          <Shield size={18} className="text-miau-pink" />
          <h2 className="font-bold text-white">Staking Tiers</h2>
        </div>

        {/* Tiers table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-miau-dark-border/50">
                <th className="px-5 py-3 text-left text-xs font-medium text-miau-muted">Tier</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-miau-muted">Min. Stake</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-miau-muted">Lock Period</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-miau-muted">Fee Discount</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-miau-muted">Multiplier</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-miau-muted">Status</th>
              </tr>
            </thead>
            <tbody>
              {stakingTiers.map((tier) => {
                const isCurrentTier = stakingTier === tier.name;
                const isUpgradeable =
                  !isCurrentTier &&
                  stakingTier !== 'Gold' &&
                  ((stakingTier === 'Silver' && tier.name === 'Gold') ||
                    (stakingTier === 'Bronze' && (tier.name === 'Silver' || tier.name === 'Gold')) ||
                    (stakingTier === 'None' && true));

                return (
                  <tr
                    key={tier.name}
                    className={`border-b border-miau-dark-border/30 transition-colors ${
                      isCurrentTier
                        ? 'bg-miau-pink/10'
                        : 'hover:bg-miau-dark-hover'
                    }`}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-3 h-3 rounded-full ${
                            tier.name === 'Bronze'
                              ? 'bg-amber-600'
                              : tier.name === 'Silver'
                                ? 'bg-gray-400'
                                : 'bg-yellow-400'
                          }`}
                        />
                        <span className="font-semibold text-white">{tier.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-white">
                      {tier.minStake.toLocaleString()} MIAU
                    </td>
                    <td className="px-5 py-3.5 text-white">
                      {tier.lockDays} days
                    </td>
                    <td className="px-5 py-3.5 text-white">
                      {tier.feeDiscount === 0 ? 'None' : `${tier.feeDiscount}%`}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-white">
                      {tier.multiplier}
                    </td>
                    <td className="px-5 py-3.5">
                      {isCurrentTier ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-miau-pink text-white">
                          <CheckCircle2 size={12} />
                          YOUR TIER
                        </span>
                      ) : isUpgradeable && tier.name === 'Gold' && stakingTier === 'Silver' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-miau-warning/10 text-miau-warning">
                          <ChevronRight size={12} />
                          Upgrade available
                        </span>
                      ) : (
                        <span className="text-xs text-miau-muted/60">
                          {stakedAmount >= tier.minStake ? 'Unlocked' : 'Locked'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Rewards note */}
        <div className="px-5 py-3 bg-miau-dark-surface/50 border-t border-miau-dark-border/30">
          <p className="text-xs text-miau-muted leading-relaxed">
            You earn monthly USDC from 25% of platform profits. Expected APY: 4--6%.
          </p>
        </div>

        {/* Stake / Unstake buttons */}
        <div className="px-5 py-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={() => setShowStakeModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-miau-pink text-white rounded-xl text-sm font-semibold hover:bg-miau-pink/80 transition-colors"
          >
            <Lock size={16} />
            Stake More MIAU
          </button>
          <button
            onClick={() => setShowUnstakeModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-miau-dark-card border border-miau-dark-border rounded-xl text-sm font-semibold text-miau-muted hover:bg-miau-dark-hover transition-colors"
          >
            <Unlock size={16} />
            Unstake
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════
         4. STAKING MODAL
         ═══════════════════════════════════════ */}
      <AnimatePresence>
        {showStakeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
            onClick={() => setShowStakeModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-miau-dark-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-miau-dark-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock size={18} className="text-miau-pink" />
                  <h3 className="font-bold text-white">Stake MIAU</h3>
                </div>
                <button
                  onClick={() => setShowStakeModal(false)}
                  className="p-1.5 rounded-lg hover:bg-miau-dark-hover transition-colors"
                >
                  <X size={18} className="text-miau-muted" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                {/* Amount input */}
                <div>
                  <label className="block text-xs text-miau-muted mb-1.5 font-medium">
                    Amount to Stake (MIAU)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    min="0"
                    max={miauBalance}
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    className="w-full bg-miau-dark-surface border border-miau-dark-border rounded-xl px-4 py-2.5 font-mono text-sm text-white focus:outline-none focus:border-miau-pink transition-colors"
                    placeholder="0"
                  />
                  <p className="text-[10px] text-miau-muted/60 mt-1">
                    Available: {miauBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MIAU
                  </p>
                </div>

                {/* Lock period selector */}
                <div>
                  <label className="block text-xs text-miau-muted mb-1.5 font-medium">
                    Lock Period
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {([30, 90, 365] as const).map((days) => (
                      <button
                        key={days}
                        onClick={() => setStakeLockPeriod(days)}
                        className={`py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                          stakeLockPeriod === days
                            ? 'bg-miau-pink text-white shadow-glow'
                            : 'bg-miau-dark-surface text-miau-muted hover:bg-miau-dark-hover'
                        }`}
                      >
                        {days} days
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tier preview */}
                {parsedStakeAmount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-miau-dark-surface/60 rounded-xl p-3 space-y-2 text-xs"
                  >
                    <div className="flex justify-between">
                      <span className="text-miau-muted">New Staked Total</span>
                      <span className="font-mono text-white font-medium">
                        {previewStakedTotal.toLocaleString()} MIAU
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-miau-muted">Tier After Staking</span>
                      <span
                        className={`font-semibold ${
                          previewTier !== stakingTier
                            ? 'text-miau-success'
                            : 'text-white'
                        }`}
                      >
                        {previewTier}
                        {previewTier !== stakingTier && ' (upgrade!)'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-miau-muted">Est. Monthly USDC Rewards</span>
                      <span className="font-mono text-white font-medium">
                        ${estimatedMonthlyRewards.toFixed(2)}
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* Confirm button */}
                <button
                  onClick={handleStake}
                  disabled={parsedStakeAmount <= 0 || parsedStakeAmount > miauBalance}
                  className="w-full py-3 rounded-xl font-semibold text-sm bg-miau-pink text-white hover:bg-miau-pink/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Confirm Stake
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════
         5. UNSTAKE MODAL
         ═══════════════════════════════════════ */}
      <AnimatePresence>
        {showUnstakeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
            onClick={() => setShowUnstakeModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-miau-dark-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-miau-dark-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Unlock size={18} className="text-miau-pink" />
                  <h3 className="font-bold text-white">Unstake MIAU</h3>
                </div>
                <button
                  onClick={() => setShowUnstakeModal(false)}
                  className="p-1.5 rounded-lg hover:bg-miau-dark-hover transition-colors"
                >
                  <X size={18} className="text-miau-muted" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                {/* Current stake info */}
                <div className="bg-miau-dark-surface/60 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-miau-muted">Current Staked Amount</span>
                    <span className="font-mono font-semibold text-white">
                      {stakedAmount.toLocaleString()} MIAU
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-miau-muted">Current Tier</span>
                    <span className="font-semibold text-white">{stakingTier}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-miau-muted">Lock Expiry Date</span>
                    <span className="font-mono font-semibold text-white">{lockExpiryDate}</span>
                  </div>
                </div>

                {/* Lock warning */}
                {lockActive && (
                  <div className="flex items-start gap-2 bg-miau-warning/10 border border-miau-warning/30 rounded-xl px-3 py-3">
                    <AlertTriangle size={16} className="text-miau-warning shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-miau-warning font-semibold">Lock Period Active</p>
                      <p className="text-xs text-miau-warning/80 mt-0.5 leading-relaxed">
                        Your MIAU is locked until {lockExpiryDate}. You can&apos;t withdraw early -- hang tight!
                      </p>
                    </div>
                  </div>
                )}

                {/* Confirm button (disabled because lock is active) */}
                <button
                  disabled={lockActive}
                  className="w-full py-3 rounded-xl font-semibold text-sm bg-miau-error text-white hover:bg-miau-error/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {lockActive
                    ? `Locked until ${lockExpiryDate}`
                    : 'Confirm Unstake'}
                </button>

                <button
                  onClick={() => setShowUnstakeModal(false)}
                  className="w-full py-2.5 rounded-xl text-xs font-medium text-miau-muted hover:bg-miau-dark-hover transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Two-column grid for Fee Calculator + Token Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ═══════════════════════════════════════
           6. FEE CALCULATOR WIDGET
           ═══════════════════════════════════════ */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-miau-dark-border/60 flex items-center gap-2">
            <Calculator size={18} className="text-miau-pink" />
            <h2 className="font-bold text-white">Fee Calculator</h2>
          </div>
          <div className="p-5 space-y-4">
            {/* Trade size input */}
            <div>
              <label className="block text-xs text-miau-muted mb-1.5 font-medium">
                Trade Size (MIAU)
              </label>
              <input
                type="number"
                step="100"
                min="0"
                value={tradeSize}
                onChange={(e) => setTradeSize(e.target.value)}
                className="w-full bg-miau-dark-surface border border-miau-dark-border rounded-xl px-4 py-2.5 font-mono text-sm text-white focus:outline-none focus:border-miau-pink transition-colors"
                placeholder="1000"
              />
            </div>

            {/* Fee breakdown */}
            {parsedTradeSize > 0 && (
              <div className="bg-miau-dark-surface/70 rounded-xl p-4 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-miau-muted">Standard Fee (0.25%)</span>
                  <span className="font-mono text-white">{standardFee.toFixed(2)} MIAU</span>
                </div>
                {feeDiscount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-miau-muted flex items-center gap-1">
                      <Shield size={12} className="text-miau-success" />
                      {stakingTier} Discount (-{feeDiscount}%)
                    </span>
                    <span className="font-mono text-miau-success">
                      -{feeSaving.toFixed(2)} MIAU
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-miau-muted">
                    Your Rate ({(discountedFeeRate * 100).toFixed(3)}%)
                  </span>
                  <span className="font-mono font-semibold text-white">
                    {discountedFee.toFixed(2)} MIAU
                  </span>
                </div>
                {feeDiscount > 0 && (
                  <div className="border-t border-miau-dark-border/30 pt-2">
                    <div className="flex justify-between">
                      <span className="text-miau-muted font-medium">You save per trade</span>
                      <span className="font-mono font-semibold text-miau-success">
                        {feeSaving.toFixed(2)} MIAU
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Example text */}
            <p className="text-xs text-miau-muted leading-relaxed bg-miau-dark-surface/50 rounded-xl px-3 py-2.5">
              On a {parsedTradeSize > 0 ? parsedTradeSize.toLocaleString() : '1,000'} MIAU trade, you pay{' '}
              <span className="font-mono font-semibold text-white">
                {(parsedTradeSize > 0 ? discountedFee : 2.25).toFixed(2)} MIAU
              </span>{' '}
              instead of{' '}
              <span className="font-mono text-miau-muted/60 line-through">
                {(parsedTradeSize > 0 ? standardFee : 2.50).toFixed(2)} MIAU
              </span>
            </p>
          </div>
        </div>

        {/* ═══════════════════════════════════════
           7. MIAU TOKEN STATS
           ═══════════════════════════════════════ */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-miau-dark-border/60 flex items-center gap-2">
            <TrendingUp size={18} className="text-miau-pink" />
            <h2 className="font-bold text-white">MIAU Token Stats</h2>
          </div>
          <div className="p-5 space-y-4">
            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-miau-dark-surface/70 rounded-xl p-3">
                <p className="text-[10px] text-miau-muted uppercase tracking-wide">Price</p>
                <p className="text-lg font-bold text-white font-mono">
                  ${miauTokenStats.price.toFixed(2)}
                </p>
              </div>
              <div className="bg-miau-dark-surface/70 rounded-xl p-3">
                <p className="text-[10px] text-miau-muted uppercase tracking-wide">24h Change</p>
                <p
                  className={`text-lg font-bold font-mono flex items-center gap-1 ${
                    miauTokenStats.priceChange24h >= 0 ? 'text-miau-success' : 'text-miau-error'
                  }`}
                >
                  {miauTokenStats.priceChange24h >= 0 ? (
                    <TrendingUp size={16} />
                  ) : (
                    <TrendingDown size={16} />
                  )}
                  {miauTokenStats.priceChange24h >= 0 ? '+' : ''}
                  {miauTokenStats.priceChange24h.toFixed(1)}%
                </p>
              </div>
              <div className="bg-miau-dark-surface/70 rounded-xl p-3">
                <p className="text-[10px] text-miau-muted uppercase tracking-wide">Market Cap</p>
                <p className="text-lg font-bold text-white font-mono">
                  ${(miauTokenStats.marketCap / 1000000000).toFixed(0)}B
                </p>
              </div>
              <div className="bg-miau-dark-surface/70 rounded-xl p-3">
                <p className="text-[10px] text-miau-muted uppercase tracking-wide">Circulating</p>
                <p className="text-lg font-bold text-white font-mono">
                  {(miauTokenStats.circulatingSupply / 1000000).toFixed(0)}M
                </p>
              </div>
            </div>

            {/* Burned stat */}
            <div className="bg-miau-dark-surface/70 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame size={16} className="text-miau-error" />
                <span className="text-xs text-miau-muted font-medium">Total Burned</span>
              </div>
              <span className="font-mono text-sm font-bold text-white">
                {(miauTokenStats.totalBurned / 1000000).toFixed(1)}M MIAU
              </span>
            </div>

            {/* 7-day price chart */}
            <div className="bg-miau-dark-surface/70 rounded-xl p-3">
              <p className="text-[10px] text-miau-muted uppercase tracking-wide mb-2">
                7-Day Price Chart
              </p>
              <div className="h-24 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceChartData}>
                    <XAxis dataKey="time" hide />
                    <YAxis domain={['auto', 'auto']} hide />
                    <Tooltip
                      contentStyle={{
                        background: '#141428',
                        border: '1px solid #2A2A4A',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontFamily: 'monospace',
                      color: '#FFFFFF',
                      }}
                      labelStyle={{ color: '#8888AA', fontSize: '10px' }}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={(value: any) => [
                        `$${(value ?? 0).toFixed(3)}`,
                        'MIAU',
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#FF2D78"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 3, fill: '#FF2D78', strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════
         8. SETTINGS TOGGLE
         ═══════════════════════════════════════ */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings size={18} className="text-miau-pink" />
            <div>
              <h3 className="text-sm font-semibold text-white">Demo: Show CDEX Access Warning</h3>
              <p className="text-xs text-miau-muted">
                Turn the access warning banner on or off.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAccessWarning(!showAccessWarning)}
            className={`relative w-12 h-7 rounded-full transition-colors ${
              showAccessWarning ? 'bg-miau-pink' : 'bg-miau-dark-border'
            }`}
          >
            <span
              className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${
                showAccessWarning ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════
         9. RECENT TRANSACTIONS TABLE
         ═══════════════════════════════════════ */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-miau-dark-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-miau-pink" />
            <h2 className="font-bold text-white">Recent Transactions</h2>
          </div>
          <span className="text-xs text-miau-muted font-mono">
            {walletTransactions.length} transactions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-miau-dark-border/50">
                <th className="px-5 py-3 text-left text-xs font-medium text-miau-muted">Date</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-miau-muted">Type</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-miau-muted">Amount</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-miau-muted">Pair</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-miau-muted">Fee</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-miau-muted">Status</th>
              </tr>
            </thead>
            <tbody>
              {walletTransactions.slice(0, 15).map((tx, index) => (
                <tr
                  key={tx.id}
                  className={`border-b border-miau-dark-border/20 transition-colors hover:bg-miau-dark-hover ${
                    index % 2 === 0 ? 'bg-miau-dark-card' : 'bg-miau-dark-surface/30'
                  }`}
                >
                  <td className="px-5 py-3 text-xs text-white whitespace-nowrap">
                    {tx.date}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap ${txTypeBadge(
                        tx.type,
                      )}`}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-white whitespace-nowrap">
                    {tx.amount}
                  </td>
                  <td className="px-5 py-3 text-xs text-white whitespace-nowrap">
                    {tx.pair}
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-miau-muted whitespace-nowrap">
                    {tx.fee}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-medium ${
                        tx.status === 'Confirmed'
                          ? 'text-miau-success'
                          : 'text-miau-warning'
                      }`}
                    >
                      {tx.status === 'Confirmed' ? (
                        <CheckCircle2 size={12} />
                      ) : (
                        <Clock size={12} />
                      )}
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
