'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { motion } from 'framer-motion';
import {
  Wallet,
  TrendingUp,
  ArrowRightLeft,
  Lock,
  Shield,
  Clock,
  CheckCircle2,
  Loader2,
  XCircle,
  ExternalLink,
  Eye,
} from 'lucide-react';
import {
  portfolioHoldings,
  portfolioDistributions,
  portfolioSummary,
  portfolioPerformanceData,
  type PortfolioHolding,
  type OpenOrder,
} from '@/lib/dummyData';
import { useApp } from '@/context/AppContext';

/* ───────────────────────────────────────────
   Edition filter options
   ─────────────────────────────────────────── */
type EditionFilter = 'All' | 'Founders' | 'Limited' | 'Standard';
const editionFilters: EditionFilter[] = ['All', 'Founders', 'Limited', 'Standard'];

/* ───────────────────────────────────────────
   Distribution creator filter options
   ─────────────────────────────────────────── */
type DistributionCreatorFilter = 'All' | 'NellaCAT' | 'MiaCAT' | 'CocoCAT' | 'NovaCAT';
const distributionCreatorFilters: DistributionCreatorFilter[] = [
  'All',
  'NellaCAT',
  'MiaCAT',
  'CocoCAT',
  'NovaCAT',
];

/* ───────────────────────────────────────────
   Pie chart colors for creators
   ─────────────────────────────────────────── */
const creatorPieColors: Record<string, string> = {
  'Nella Rose': '#C4456B',
  'Mia Storm': '#E8739A',
  'Coco Blaze': '#FFB2D0',
  'Nova Reign': '#F5A0B8',
};

/* ───────────────────────────────────────────
   Card animation variant
   ─────────────────────────────────────────── */
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: i * 0.08 },
  }),
};

/* ═══════════════════════════════════════════
   PORTFOLIO PAGE
   ═══════════════════════════════════════════ */
export default function PortfolioPage() {
  const { openOrders, cancelOrder, showToast } = useApp();

  /* ── Filter state ──────────────────────── */
  const [editionFilter, setEditionFilter] = useState<EditionFilter>('All');
  const [distCreatorFilter, setDistCreatorFilter] = useState<DistributionCreatorFilter>('All');
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);

  /* ── Filtered holdings ─────────────────── */
  const filteredHoldings = useMemo(() => {
    if (editionFilter === 'All') return portfolioHoldings;
    return portfolioHoldings.filter((h) => h.edition === editionFilter);
  }, [editionFilter]);

  /* ── Filtered distributions ────────────── */
  const filteredDistributions = useMemo(() => {
    if (distCreatorFilter === 'All') return portfolioDistributions.slice(0, 20);
    return portfolioDistributions
      .filter((d) => d.catSymbol === distCreatorFilter)
      .slice(0, 20);
  }, [distCreatorFilter]);

  /* ── Pie chart data ────────────────────── */
  const pieData = useMemo(() => {
    const creatorMap: Record<string, number> = {};
    portfolioHoldings.forEach((h) => {
      const value = h.catsHeld * h.currentPrice;
      creatorMap[h.creatorName] = (creatorMap[h.creatorName] || 0) + value;
    });
    return Object.entries(creatorMap).map(([name, value]) => ({
      name,
      value,
    }));
  }, []);

  /* ── Cancel order handler ──────────────── */
  const handleCancelOrder = (id: string) => {
    cancelOrder(id);
    setCancelConfirmId(null);
    showToast('Order cancelled successfully.');
  };

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */
  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 lg:pb-6">
      {/* ── Page Title ──────────────────────── */}
      <div className="space-y-1">
        <h1 className="text-2xl lg:text-3xl font-serif font-bold text-miau-brown">
          Portfolio Dashboard
        </h1>
        <p className="text-sm text-miau-rose-brown">
          Track your Creator Access Token holdings, ETH distributions, and staking status.
        </p>
      </div>

      {/* ═══════════════════════════════════════
         SECTION 1 — Summary Cards Row
         ═══════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Portfolio Value */}
        <motion.div
          custom={0}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-miau-blush border border-miau-taupe rounded-2xl shadow-sm p-5 space-y-2"
        >
          <div className="flex items-center gap-2 text-miau-rose-brown">
            <Wallet size={16} />
            <span className="text-xs font-medium">Total Portfolio Value</span>
          </div>
          <p className="text-2xl font-bold text-miau-brown">
            {portfolioSummary.totalValue.toLocaleString()}{' '}
            <span className="text-sm font-normal text-miau-rose-brown">MIAU</span>
          </p>
          <p className="text-xs text-miau-grey">
            ~${portfolioSummary.totalValue.toLocaleString()}
          </p>
        </motion.div>

        {/* Card 2: Total ETH Distributions Received */}
        <motion.div
          custom={1}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-miau-blush border border-miau-taupe rounded-2xl shadow-sm p-5 space-y-2"
        >
          <div className="flex items-center gap-2 text-miau-rose-brown">
            <TrendingUp size={16} />
            <span className="text-xs font-medium">Total ETH Distributions</span>
          </div>
          <p className="text-2xl font-bold text-miau-brown">
            {portfolioSummary.totalETHReceived}{' '}
            <span className="text-sm font-normal text-miau-rose-brown">ETH</span>
          </p>
          <p className="text-xs text-miau-grey">
            ~${(portfolioSummary.totalETHReceived * 1000).toLocaleString()}
          </p>
        </motion.div>

        {/* Card 3: Unrealised P&L */}
        <motion.div
          custom={2}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-miau-blush border border-miau-taupe rounded-2xl shadow-sm p-5 space-y-2"
        >
          <div className="flex items-center gap-2 text-miau-rose-brown">
            <ArrowRightLeft size={16} />
            <span className="text-xs font-medium">Unrealised P&L</span>
          </div>
          <p className="text-2xl font-bold text-miau-success">
            +{portfolioSummary.unrealisedPnL.toLocaleString()}{' '}
            <span className="text-sm font-normal">MIAU</span>
          </p>
          <p className="text-xs text-miau-success font-medium">
            +{portfolioSummary.unrealisedPnLPercent}%
          </p>
        </motion.div>

        {/* Card 4: MIAU Balance */}
        <motion.div
          custom={3}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-miau-blush border border-miau-taupe rounded-2xl shadow-sm p-5 space-y-2"
        >
          <div className="flex items-center gap-2 text-miau-rose-brown">
            <Wallet size={16} />
            <span className="text-xs font-medium">MIAU Balance</span>
          </div>
          <p className="text-2xl font-bold text-miau-brown">
            {portfolioSummary.miauBalance.toLocaleString()}{' '}
            <span className="text-sm font-normal text-miau-rose-brown">MIAU</span>
          </p>
          <p className="text-xs text-miau-grey">Available for trading</p>
        </motion.div>

        {/* Card 5: Staking Status */}
        <motion.div
          custom={4}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-miau-blush border border-miau-taupe rounded-2xl shadow-sm p-5 space-y-2"
        >
          <div className="flex items-center gap-2 text-miau-rose-brown">
            <Lock size={16} />
            <span className="text-xs font-medium">Staking Status</span>
          </div>
          <p className="text-2xl font-bold text-miau-brown">
            {portfolioSummary.stakingTier}
          </p>
          <div className="space-y-1 text-xs text-miau-rose-brown">
            <p>{portfolioSummary.stakedAmount.toLocaleString()} MIAU staked</p>
            <p className="flex items-center gap-1">
              <Clock size={10} />
              90-day lock, expires Apr 2026
            </p>
            <p className="flex items-center gap-1 text-miau-success font-medium">
              <Shield size={10} />
              {portfolioSummary.feeDiscount}% fee discount
            </p>
          </div>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════
         SECTION 2 — Holdings Table
         ═══════════════════════════════════════ */}
      <motion.div
        custom={5}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="bg-miau-blush border border-miau-taupe rounded-2xl shadow-sm overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-miau-taupe flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="font-serif font-semibold text-lg text-miau-brown">
            Your Holdings
          </h2>
          <div className="flex items-center gap-2">
            {editionFilters.map((filter) => (
              <button
                key={filter}
                onClick={() => setEditionFilter(filter)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  editionFilter === filter
                    ? 'bg-miau-dark text-white shadow-sm'
                    : 'bg-white border border-miau-taupe text-miau-rose-brown hover:bg-miau-pale hover:text-miau-brown'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-miau-rose-brown font-medium border-b border-miau-taupe">
                <th className="text-left px-5 py-3">Creator</th>
                <th className="text-left px-3 py-3">CAT Symbol</th>
                <th className="text-left px-3 py-3">Edition</th>
                <th className="text-right px-3 py-3">CATs Held</th>
                <th className="text-right px-3 py-3">Avg Buy Price</th>
                <th className="text-right px-3 py-3">Current Price</th>
                <th className="text-right px-3 py-3">P&L</th>
                <th className="text-right px-3 py-3">Weekly ETH Yield</th>
                <th className="text-center px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHoldings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-miau-rose-brown text-sm">
                    No holdings match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredHoldings.map((holding, idx) => (
                  <tr
                    key={holding.id}
                    className={`border-b border-miau-taupe/30 hover:bg-miau-pale/60 transition-colors ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-miau-pale'
                    }`}
                  >
                    <td className="px-5 py-3 font-medium text-miau-brown whitespace-nowrap">
                      {holding.creatorName}
                    </td>
                    <td className="px-3 py-3 font-mono text-miau-brown whitespace-nowrap">
                      {holding.catSymbol}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          holding.edition === 'Founders'
                            ? 'bg-yellow-100 text-yellow-800'
                            : holding.edition === 'Limited'
                              ? 'bg-miau-pink/20 text-miau-dark'
                              : 'bg-miau-pale text-miau-brown'
                        }`}
                      >
                        {holding.edition}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-miau-brown">
                      {holding.catsHeld}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-miau-brown">
                      {holding.avgBuyPrice.toFixed(2)} MIAU
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-miau-brown">
                      {holding.currentPrice.toFixed(2)} MIAU
                    </td>
                    <td className="px-3 py-3 text-right whitespace-nowrap">
                      <span
                        className={`font-mono font-medium ${
                          holding.pnl >= 0 ? 'text-miau-success' : 'text-miau-error'
                        }`}
                      >
                        {holding.pnl >= 0 ? '+' : ''}
                        {holding.pnl.toFixed(2)} MIAU
                      </span>
                      <span
                        className={`block text-xs ${
                          holding.pnlPercent >= 0 ? 'text-miau-success' : 'text-miau-error'
                        }`}
                      >
                        ({holding.pnlPercent >= 0 ? '+' : ''}
                        {holding.pnlPercent.toFixed(1)}%)
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-miau-brown">
                      {holding.weeklyETHYield.toFixed(4)} ETH
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href="/trade"
                          className="flex items-center gap-1 text-xs font-medium text-miau-dark hover:text-miau-brown transition-colors"
                        >
                          <ArrowRightLeft size={12} />
                          Trade
                        </Link>
                        <Link
                          href={`/creator/${holding.creatorSlug}`}
                          className="flex items-center gap-1 text-xs font-medium text-miau-rose-brown hover:text-miau-brown transition-colors"
                        >
                          <Eye size={12} />
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════
         SECTION 3 — Weekly Distribution History
         ═══════════════════════════════════════ */}
      <motion.div
        custom={6}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="bg-miau-blush border border-miau-taupe rounded-2xl shadow-sm overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-miau-taupe space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h2 className="font-serif font-semibold text-lg text-miau-brown">
              Weekly Distribution History
            </h2>
            <p className="text-xs text-miau-rose-brown">
              All distributions paid automatically every Monday in ETH
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {distributionCreatorFilters.map((filter) => (
              <button
                key={filter}
                onClick={() => setDistCreatorFilter(filter)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  distCreatorFilter === filter
                    ? 'bg-miau-dark text-white shadow-sm'
                    : 'bg-white border border-miau-taupe text-miau-rose-brown hover:bg-miau-pale hover:text-miau-brown'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-miau-rose-brown font-medium border-b border-miau-taupe">
                <th className="text-left px-5 py-3">Date (Monday)</th>
                <th className="text-left px-3 py-3">Creator</th>
                <th className="text-left px-3 py-3">Edition</th>
                <th className="text-right px-3 py-3">ETH Amount</th>
                <th className="text-right px-3 py-3">USD Equiv</th>
                <th className="text-center px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredDistributions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-miau-rose-brown text-sm">
                    No distributions found for the selected creator.
                  </td>
                </tr>
              ) : (
                filteredDistributions.map((dist, idx) => (
                  <tr
                    key={dist.id}
                    className={`border-b border-miau-taupe/30 hover:bg-miau-pale/60 transition-colors ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-miau-pale'
                    }`}
                  >
                    <td className="px-5 py-3 text-miau-brown whitespace-nowrap">
                      {dist.weekOf}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className="font-medium text-miau-brown">{dist.creatorName}</span>
                      <span className="text-xs text-miau-rose-brown ml-1.5 font-mono">
                        {dist.catSymbol}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          dist.edition === 'Founders'
                            ? 'bg-yellow-100 text-yellow-800'
                            : dist.edition === 'Limited'
                              ? 'bg-miau-pink/20 text-miau-dark'
                              : 'bg-miau-pale text-miau-brown'
                        }`}
                      >
                        {dist.edition}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right font-mono font-medium text-miau-brown">
                      {dist.totalETH.toFixed(5)} ETH
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-miau-rose-brown">
                      ~${(dist.totalETH * 1000).toFixed(2)}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-miau-success/10 text-miau-success">
                        <CheckCircle2 size={12} />
                        {dist.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════
         SECTION 4 & 5 — Charts Row
         ═══════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ── Portfolio Allocation Pie Chart ──── */}
        <motion.div
          custom={7}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-4 bg-miau-blush border border-miau-taupe rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-miau-taupe">
            <h2 className="font-serif font-semibold text-lg text-miau-brown">
              Portfolio Allocation
            </h2>
          </div>
          <div className="p-5">
            <div className="flex justify-center">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={creatorPieColors[entry.name] || '#D4A0B0'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#fff',
                      border: '1px solid #F5EDE8',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any) => [`${(value ?? 0).toLocaleString()} MIAU`, 'Value']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="mt-4 space-y-2">
              {pieData.map((entry) => {
                const totalValue = pieData.reduce((sum, e) => sum + e.value, 0);
                const pct = ((entry.value / totalValue) * 100).toFixed(1);
                return (
                  <div key={entry.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: creatorPieColors[entry.name] || '#D4A0B0' }}
                      />
                      <span className="text-miau-brown font-medium">{entry.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-miau-rose-brown">
                        {entry.value.toLocaleString()} MIAU
                      </span>
                      <span className="font-mono text-miau-grey w-12 text-right">
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* ── Performance Chart ───────────────── */}
        <motion.div
          custom={8}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-8 bg-miau-blush border border-miau-taupe rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-miau-taupe flex items-center justify-between">
            <h2 className="font-serif font-semibold text-lg text-miau-brown">
              Portfolio Performance
            </h2>
            <span className="text-xs text-miau-rose-brown">Last 3 months</span>
          </div>

          <div className="p-4">
            {/* Area chart: portfolio value over time */}
            <div className="mb-2">
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart
                  data={portfolioPerformanceData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FFB2D0" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#FFB2D0" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F5EDE8" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#8B6B61' }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                    minTickGap={50}
                  />
                  <YAxis
                    domain={['auto', 'auto']}
                    tick={{ fontSize: 10, fill: '#8B6B61' }}
                    tickLine={false}
                    axisLine={false}
                    width={50}
                    tickFormatter={(v: number) => `${(v / 1000).toFixed(1)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#fff',
                      border: '1px solid #F5EDE8',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                    }}
                    labelStyle={{ color: '#8B6B61', fontSize: '11px' }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any, name: any) => {
                      if (name === 'value') return [`${(value ?? 0).toLocaleString()} MIAU`, 'Portfolio Value'];
                      return [value ?? 0, name];
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#C4456B"
                    strokeWidth={2}
                    fill="url(#portfolioGradient)"
                    dot={false}
                    activeDot={{ r: 4, fill: '#C4456B', strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Bar chart: weekly ETH distributions */}
            <div>
              <div className="flex items-center gap-2 mb-2 px-2">
                <div className="w-3 h-3 rounded-sm bg-miau-success/60" />
                <span className="text-[10px] text-miau-rose-brown font-medium">
                  Weekly ETH Distributions (MIAU equiv.)
                </span>
              </div>
              <ResponsiveContainer width="100%" height={80}>
                <BarChart
                  data={portfolioPerformanceData}
                  margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
                >
                  <XAxis dataKey="date" hide />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      background: '#fff',
                      border: '1px solid #F5EDE8',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                    }}
                    labelStyle={{ color: '#8B6B61', fontSize: '11px' }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any) => [`${value ?? 0} MIAU equiv.`, 'Distribution']}
                  />
                  <Bar
                    dataKey="distributions"
                    fill="#22C55E"
                    opacity={0.6}
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════
         SECTION 6 — Open Orders
         ═══════════════════════════════════════ */}
      <motion.div
        custom={9}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="bg-miau-blush border border-miau-taupe rounded-2xl shadow-sm overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-miau-taupe flex items-center justify-between">
          <h2 className="font-serif font-semibold text-lg text-miau-brown">
            Open Orders
          </h2>
          <span className="text-xs text-miau-rose-brown font-mono">
            {openOrders.length} active
          </span>
        </div>

        {openOrders.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-miau-rose-brown">No open orders.</p>
            <p className="text-xs text-miau-grey mt-1">
              Place an order on the{' '}
              <Link href="/trade" className="text-miau-dark hover:underline font-medium">
                Trade
              </Link>{' '}
              page to get started.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-miau-taupe/30">
            {openOrders.map((order: OpenOrder) => (
              <div key={order.id} className="px-5 py-4 space-y-3">
                {/* Order header row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-lg ${
                        order.side === 'Buy'
                          ? 'bg-miau-success/10 text-miau-success'
                          : 'bg-miau-error/10 text-miau-error'
                      }`}
                    >
                      {order.side}
                    </span>
                    <span className="text-sm font-medium text-miau-brown">{order.pair}</span>
                    <span className="text-[10px] text-miau-rose-brown bg-miau-pale px-1.5 py-0.5 rounded">
                      {order.type}
                    </span>
                  </div>

                  {/* Status badge */}
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      order.status === 'Pending'
                        ? 'bg-amber-100 text-amber-700'
                        : order.status === 'Partial'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {order.status === 'Pending' && <Clock size={10} />}
                    {order.status === 'Partial' && <Loader2 size={10} />}
                    {order.status === 'Filled' && <CheckCircle2 size={10} />}
                    {order.status}
                  </span>
                </div>

                {/* Order details */}
                <div className="grid grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-miau-rose-brown block text-[10px]">Price</span>
                    <span className="font-mono font-medium text-miau-brown">
                      {order.price.toFixed(2)} MIAU
                    </span>
                  </div>
                  <div>
                    <span className="text-miau-rose-brown block text-[10px]">Quantity</span>
                    <span className="font-mono font-medium text-miau-brown">
                      {order.quantity}
                    </span>
                  </div>
                  <div>
                    <span className="text-miau-rose-brown block text-[10px]">Filled</span>
                    <span className="font-mono font-medium text-miau-brown">
                      {order.filled}/{order.quantity}
                    </span>
                  </div>
                  <div>
                    <span className="text-miau-rose-brown block text-[10px]">Total</span>
                    <span className="font-mono font-medium text-miau-brown">
                      {(order.price * order.quantity).toLocaleString()} MIAU
                    </span>
                  </div>
                </div>

                {/* Fill progress bar */}
                <div className="w-full bg-miau-taupe/40 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      order.status === 'Filled'
                        ? 'bg-miau-success'
                        : order.status === 'Partial'
                          ? 'bg-blue-400'
                          : 'bg-miau-taupe'
                    }`}
                    style={{ width: `${(order.filled / order.quantity) * 100}%` }}
                  />
                </div>

                {/* Cancel button */}
                {order.status !== 'Filled' && (
                  <>
                    {cancelConfirmId === order.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-miau-error font-medium">
                          Cancel this order?
                        </span>
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="text-xs bg-miau-error text-white px-3 py-1 rounded-lg font-medium hover:bg-miau-error/90 transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setCancelConfirmId(null)}
                          className="text-xs bg-miau-pale text-miau-rose-brown px-3 py-1 rounded-lg font-medium hover:bg-miau-taupe transition-colors"
                        >
                          Keep
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setCancelConfirmId(order.id)}
                        className="flex items-center gap-1 text-xs text-miau-error/70 hover:text-miau-error font-medium transition-colors"
                      >
                        <XCircle size={12} />
                        Cancel Order
                      </button>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
