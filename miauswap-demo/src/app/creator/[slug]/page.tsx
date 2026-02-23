'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Star,
  CheckCircle2,
  Shield,
  Clock,
  Users,
  Award,
  ArrowRight,
  Eye,
  Bookmark,
  ExternalLink,
  X,
  DollarSign,
  BarChart3,
  Coins,
  Calendar,
  FileText,
  RefreshCw,
  Plus,
  Info,
  Wallet,
  ArrowUpRight,
} from 'lucide-react';
import {
  creators,
  getCreatorDistributions,
  generatePriceData,
  askOrders,
  bidOrders,
} from '@/lib/dummyData';
import { useApp } from '@/context/AppContext';

/* ───────────────────────────────────────────
   Time-range options for the price chart
   ─────────────────────────────────────────── */
const timeRanges = [
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
  { label: 'ALL', days: 180 },
] as const;

/* ───────────────────────────────────────────
   Score tier badge colour helper
   ─────────────────────────────────────────── */
function tierBadge(tier: 'Platinum' | 'Gold' | 'Silver') {
  switch (tier) {
    case 'Platinum':
      return 'bg-gradient-to-r from-indigo-400 to-purple-500 text-miau-white';
    case 'Gold':
      return 'bg-gradient-to-r from-amber-400 to-yellow-500 text-miau-white';
    case 'Silver':
      return 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800';
  }
}

/* ───────────────────────────────────────────
   Fan Staking Benefits Data
   ─────────────────────────────────────────── */
const stakingTiers = [
  {
    name: 'Bronze',
    amount: '$50',
    benefits: ['Basic creator content access', 'Community chat access', 'Monthly newsletter'],
  },
  {
    name: 'Silver',
    amount: '$250',
    benefits: ['All Bronze benefits', 'Early content access (24h)', 'Exclusive polls & Q&A', 'Silver badge'],
  },
  {
    name: 'Gold',
    amount: '$1,000',
    benefits: ['All Silver benefits', 'Private group chat', 'Behind-the-scenes content', 'Gold badge', 'Priority support'],
  },
  {
    name: 'Platinum',
    amount: '$5,000',
    benefits: ['All Gold benefits', '1-on-1 video call (quarterly)', 'Custom content requests', 'Platinum badge', 'Revenue report access'],
  },
  {
    name: 'Diamond',
    amount: '$25,000',
    benefits: ['All Platinum benefits', 'Monthly 1-on-1 calls', 'Co-creation opportunities', 'Diamond badge', 'Advisory board seat', 'Name in credits'],
  },
];

/* ───────────────────────────────────────────
   Listing Tier Data
   ─────────────────────────────────────────── */
const listingTiers = [
  { name: 'Standard', price: '$250', description: 'Self-service listing on CDEX marketplace' },
  { name: 'Featured', price: '$1,000', description: 'Promoted placement + social media spotlight' },
  { name: 'Managed', price: '3-5%', description: 'Full managed launch with marketing support' },
];

/* ═══════════════════════════════════════════
   CREATOR PROFILE PAGE
   ═══════════════════════════════════════════ */
export default function CreatorProfilePage({ params }: { params: { slug: string } }) {
  const creator = creators.find(c => c.slug === params.slug) || creators[0];
  const { showToast } = useApp();

  /* ── View toggle ─────────────────────────── */
  const [isCreatorView, setIsCreatorView] = useState(false);

  /* ── Chart state ─────────────────────────── */
  const [activeRange, setActiveRange] = useState<string>('30D');

  const chartData = useMemo(() => {
    const range = timeRanges.find(r => r.label === activeRange) ?? timeRanges[1];
    return generatePriceData(creator.currentPrice, range.days, 0.06);
  }, [creator, activeRange]);

  const distributions = useMemo(() => getCreatorDistributions(creator), [creator]);

  /* ── Creator View: Modal state ───────────── */
  const [showOfferingModal, setShowOfferingModal] = useState(false);
  const [offeringSubmitted, setOfferingSubmitted] = useState(false);

  /* ── Creator View: Offering form state ──── */
  const [offeringFounders, setOfferingFounders] = useState('5');
  const [offeringLimited, setOfferingLimited] = useState('25');
  const [listingTier, setListingTier] = useState('Standard');
  const [capitalUse, setCapitalUse] = useState('');
  const [growthProjections, setGrowthProjections] = useState('');
  const [lockUpConfirmed, setLockUpConfirmed] = useState(false);
  const [declarationConfirmed, setDeclarationConfirmed] = useState(false);

  /* ── Derived values ──────────────────────── */
  const totalRevenue90d = creator.monthlyRevenue * 3;
  const weeklyDistUSD = creator.weeklyDistributionETH * 1000; // ~$1000/ETH approximation
  const creatorSharePercent = 88;
  const catHolderPercent = 12;
  const platformFeePercent = 8;
  const thisWeekRevenue = 14200;
  const netAfterPlatformFee = Math.round(thisWeekRevenue * (1 - platformFeePercent / 100));
  const catHolderShare = Math.round(netAfterPlatformFee * (catHolderPercent / 100));
  const creatorShare = netAfterPlatformFee - catHolderShare;
  const estimatedPerCAT = (catHolderShare / creator.catsIssued / 1000).toFixed(5);

  /* ── Holder distribution data (Investor View) ── */
  const holderDistributionData = [
    { name: 'Founders (Top Holders)', value: creator.foundersIssued, color: '#C4456B' },
    { name: 'Limited Edition Holders', value: creator.limitedIssued - creator.limitedRemaining, color: '#E8739A' },
    { name: 'Standard Holders', value: creator.standardIssued - creator.standardRemaining, color: '#FFB2D0' },
    { name: 'Unsold (Available)', value: creator.limitedRemaining + creator.standardRemaining + creator.foundersRemaining, color: '#F5EDE8' },
  ];

  /* ── Offering form helpers ──────────────── */
  const parsedFounders = parseInt(offeringFounders) || 0;
  const parsedLimited = parseInt(offeringLimited) || 0;
  const parsedStandard = 80 - parsedFounders - parsedLimited;
  const estimatedRaise = parsedFounders * 280 + parsedLimited * 140 + Math.max(0, parsedStandard) * 100;

  /* ── Order book depth helpers ───────────── */
  const maxAskQty = useMemo(() => Math.max(...askOrders.map(o => o.quantity)), []);
  const maxBidQty = useMemo(() => Math.max(...bidOrders.map(o => o.quantity)), []);

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */
  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 lg:pb-6">
      {/* ─── View Toggle Button (Top Right) ─── */}
      <div className="flex justify-end">
        <button
          onClick={() => setIsCreatorView(!isCreatorView)}
          className="flex items-center gap-2 px-5 py-2.5 bg-miau-dark-card border border-miau-dark-border rounded-2xl text-xs font-semibold text-miau-white hover:bg-miau-dark-hover transition-colors shadow-card"
        >
          <Eye size={14} />
          {isCreatorView ? 'Switch to Investor View' : 'Switch to Creator View'}
        </button>
      </div>

      {/* ═══════════════════════════════════════
         HERO SECTION (shared by both views)
         ═══════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl"
        style={{
          background: `linear-gradient(135deg, ${creator.gradientFrom}, ${creator.gradientTo})`,
        }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-miau-dark-card/10" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-miau-dark-card/5" />

        <div className="relative px-6 py-8 md:px-10 md:py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl shadow-lg border border-white/20 overflow-hidden">
              <Image
                src={creator.thumbnail}
                alt={creator.name}
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-extrabold text-miau-white">
                  {creator.name}
                </h1>
                {/* Miau Creator Score Badge */}
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full shadow-card ${tierBadge(creator.scoreTier)}`}>
                  {creator.score} {creator.scoreTier}
                </span>
              </div>

              <p className="text-white/80 text-sm max-w-2xl">{creator.tagline}</p>

              {/* Social proof row */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-white/70">
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} />
                  Member since {creator.memberSince}
                </span>
                <span className="flex items-center gap-1.5">
                  <Coins size={13} />
                  {creator.catsIssued} CATs issued
                </span>
                <span className="flex items-center gap-1.5">
                  <Wallet size={13} />
                  {creator.totalETHPaid.toFixed(3)} ETH distributions paid
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3 pt-1">
                <Link
                  href="/trade"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-miau-dark-card text-miau-pink rounded-xl text-sm font-semibold hover:bg-miau-cream transition-colors shadow-card"
                >
                  Trade {creator.catSymbol}
                  <ArrowRight size={14} />
                </Link>
                <button
                  onClick={() => showToast(`${creator.catSymbol} added to your watchlist!`)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-miau-dark-card/20 backdrop-blur-sm text-miau-white rounded-xl text-sm font-semibold hover:bg-miau-dark-card/30 transition-colors border border-white/20"
                >
                  <Bookmark size={14} />
                  Add to Watchlist
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════
         INVESTOR VIEW
         ═══════════════════════════════════════ */}
      {!isCreatorView && (
        <motion.div
          key="investor-view"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* ─── Section 2: Key Metrics Row ────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Current CAT Price */}
            <div className="bg-miau-dark-card border border-miau-dark-border rounded-2xl p-5">
              <p className="text-xs text-miau-muted mb-1 font-medium">Current CAT Price</p>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-miau-white">{creator.currentPrice} MIAU</span>
                <span
                  className={`text-xs font-semibold flex items-center gap-0.5 mb-1 ${
                    creator.priceChange24h >= 0 ? 'text-miau-success' : 'text-miau-error'
                  }`}
                >
                  {creator.priceChange24h >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {creator.priceChange24h >= 0 ? '+' : ''}
                  {creator.priceChange24h.toFixed(1)}% (24h)
                </span>
              </div>
            </div>

            {/* Weekly Distribution per CAT */}
            <div className="bg-miau-dark-card border border-miau-dark-border rounded-2xl p-5">
              <p className="text-xs text-miau-muted mb-1 font-medium">Weekly Distribution / CAT</p>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-miau-white">{creator.weeklyDistributionETH} ETH</span>
              </div>
              <p className="text-xs text-miau-muted mt-1">~${weeklyDistUSD.toFixed(2)}</p>
            </div>

            {/* Annualised Yield */}
            <div className="bg-miau-dark-card border border-miau-dark-border rounded-2xl p-5">
              <p className="text-xs text-miau-muted mb-1 font-medium">Annualised Yield</p>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-miau-success">{creator.annualYield}%</span>
                <TrendingUp size={16} className="text-miau-success mb-1" />
              </div>
              <p className="text-xs text-miau-muted mt-1">Based on current distributions</p>
            </div>

            {/* Total Revenue (90 days) */}
            <div className="bg-miau-dark-card border border-miau-dark-border rounded-2xl p-5">
              <p className="text-xs text-miau-muted mb-1 font-medium">Total Revenue (90 days)</p>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-miau-white">${totalRevenue90d.toLocaleString()}</span>
              </div>
              <p className="text-xs text-miau-muted mt-1">${creator.monthlyRevenue.toLocaleString()}/mo avg</p>
            </div>
          </div>

          {/* ─── Section 3: Price Chart ──────── */}
          <div className="bg-miau-dark-card border border-miau-dark-border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-miau-dark-border flex items-center justify-between flex-wrap gap-2">
              <h2 className="font-bold text-lg text-miau-white">
                {creator.catSymbol} Price Chart
              </h2>
              <div className="flex items-center gap-1">
                {timeRanges.map(r => (
                  <button
                    key={r.label}
                    onClick={() => setActiveRange(r.label)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      activeRange === r.label
                        ? 'bg-miau-pink text-miau-white'
                        : 'text-miau-muted hover:bg-miau-dark-hover'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="px-3 pt-6 pb-2">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="creatorPriceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FF2D78" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#FF2D78" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A4A" vertical={false} />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 10, fill: '#8888AA' }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                    minTickGap={60}
                  />
                  <YAxis
                    domain={['auto', 'auto']}
                    tick={{ fontSize: 10, fill: '#8888AA' }}
                    tickLine={false}
                    axisLine={false}
                    width={50}
                    tickFormatter={(v: number) => v.toFixed(0)}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#141428',
                      border: '1px solid #2A2A4A',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#FFFFFF',
                      fontFamily: 'monospace',
                    }}
                    labelStyle={{ color: '#8888AA', fontSize: '11px' }}
                    formatter={(value: any) => [`${(value ?? 0).toFixed(2)} MIAU`, 'Price']}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#FF2D78"
                    strokeWidth={2}
                    fill="url(#creatorPriceGradient)"
                    dot={false}
                    activeDot={{ r: 4, fill: '#FF2D78', strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ─── Section 4: CAT Edition Breakdown ── */}
          <div>
            <h2 className="font-bold text-lg text-miau-white mb-4">CAT Edition Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Founders Edition */}
              <div className="bg-miau-dark-card border border-miau-dark-border rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-amber-400 to-yellow-500 px-5 py-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-miau-white">Founders Edition</h3>
                    <Award size={18} className="text-white/80" />
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-miau-muted">Issued</span>
                    <span className="font-semibold text-miau-white">{creator.foundersIssued}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-miau-muted">Remaining</span>
                    <span className="font-semibold text-miau-error">
                      {creator.foundersRemaining === 0 ? 'ALL SOLD' : `${creator.foundersRemaining} left`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-miau-muted">Floor Price</span>
                    <span className="font-semibold text-miau-white">280 MIAU</span>
                  </div>
                  <div className="border-t border-miau-dark-border pt-3 space-y-2">
                    <p className="text-xs font-semibold text-miau-white">Features:</p>
                    <ul className="space-y-1.5">
                      {['1-of-1 artwork', 'Private channel access', 'OG badge', 'Personal creator message'].map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-miau-muted">
                          <CheckCircle2 size={12} className="text-miau-success shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Limited Edition */}
              <div className="bg-miau-dark-card border border-miau-dark-border rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-miau-rose to-miau-dark px-5 py-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-miau-white">Limited Edition</h3>
                    <Star size={18} className="text-white/80" />
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-miau-muted">Issued</span>
                    <span className="font-semibold text-miau-white">{creator.limitedIssued}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-miau-muted">Remaining</span>
                    <span className={`font-semibold ${creator.limitedRemaining === 0 ? 'text-miau-error' : 'text-miau-warning'}`}>
                      {creator.limitedRemaining === 0 ? 'ALL SOLD' : `${creator.limitedRemaining} remaining`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-miau-muted">Floor Price</span>
                    <span className="font-semibold text-miau-white">140 MIAU</span>
                  </div>
                  <div className="border-t border-miau-dark-border pt-3 space-y-2">
                    <p className="text-xs font-semibold text-miau-white">Features:</p>
                    <ul className="space-y-1.5">
                      {['Themed art set', 'Bonus content access', 'Early access to new releases'].map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-miau-muted">
                          <CheckCircle2 size={12} className="text-miau-success shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Standard Edition */}
              <div className="bg-miau-dark-card border border-miau-dark-border rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-miau-pink to-miau-rose px-5 py-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-miau-white">Standard Edition</h3>
                    <Users size={18} className="text-white/80" />
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-miau-muted">Issued</span>
                    <span className="font-semibold text-miau-white">{creator.standardIssued}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-miau-muted">Remaining</span>
                    <span className={`font-semibold ${creator.standardRemaining === 0 ? 'text-miau-error' : 'text-miau-success'}`}>
                      {creator.standardRemaining === 0 ? 'ALL SOLD' : `${creator.standardRemaining} remaining`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-miau-muted">Floor Price</span>
                    <span className="font-semibold text-miau-white">100 MIAU</span>
                  </div>
                  <div className="border-t border-miau-dark-border pt-3 space-y-2">
                    <p className="text-xs font-semibold text-miau-white">Features:</p>
                    <ul className="space-y-1.5">
                      {['Creator branding', 'Revenue claim rights'].map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-miau-muted">
                          <CheckCircle2 size={12} className="text-miau-success shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-miau-muted mt-3 text-center italic">
              All editions carry identical 0.1% revenue claim, distributed weekly in ETH.
            </p>
          </div>

          {/* ─── Section 5: Weekly Revenue Distribution History ── */}
          <div className="bg-miau-dark-card border border-miau-dark-border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-miau-dark-border">
              <h2 className="font-bold text-lg text-miau-white">
                Weekly Revenue Distribution History
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-miau-dark-border bg-miau-dark-surface/40">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-miau-muted">Week</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-miau-muted">Gross Revenue</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-miau-muted">Net Revenue</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-miau-muted">Dist / CAT (ETH)</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-miau-muted">Total ETH Paid</th>
                    <th className="text-center px-5 py-3 text-xs font-semibold text-miau-muted">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {distributions.map(dist => (
                    <tr key={dist.id} className="border-b border-miau-dark-border/30 hover:bg-miau-dark-hover/30 transition-colors">
                      <td className="px-5 py-3 font-medium text-miau-white">{dist.weekOf}</td>
                      <td className="px-5 py-3 text-right font-mono text-miau-white">
                        ${dist.grossRevenue.toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-miau-white">
                        ${dist.netRevenue.toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-miau-white">
                        {dist.distributionPerCAT.toFixed(5)}
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-miau-white">
                        {dist.totalETH.toFixed(3)}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                            dist.status === 'Paid'
                              ? 'bg-miau-success/10 text-miau-success'
                              : 'bg-miau-warning/10 text-miau-warning'
                          }`}
                        >
                          {dist.status === 'Paid' && <CheckCircle2 size={12} />}
                          {dist.status === 'Pending' && <Clock size={12} />}
                          {dist.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ─── Section 6: CAT Offering Details ── */}
          <div className="bg-miau-dark-card border border-miau-dark-border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-miau-dark-border">
              <h2 className="font-bold text-lg text-miau-white">CAT Offering Details</h2>
            </div>
            <div className="p-5 space-y-5">
              {/* Structure info grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-miau-dark-surface rounded-xl p-4">
                  <p className="text-xs text-miau-muted mb-1">Total Revenue % Offered</p>
                  <p className="text-xl font-bold text-miau-white">12%</p>
                  <p className="text-xs text-miau-muted mt-1">Across {creator.catsIssued} CATs (0.1% each)</p>
                </div>
                <div className="bg-miau-dark-surface rounded-xl p-4">
                  <p className="text-xs text-miau-muted mb-1">Initial Prices</p>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-miau-white">Founders: 250 MIAU</p>
                    <p className="text-sm font-semibold text-miau-white">Limited: 120 MIAU</p>
                    <p className="text-sm font-semibold text-miau-white">Standard: 80 MIAU</p>
                  </div>
                </div>
                <div className="bg-miau-dark-surface rounded-xl p-4">
                  <p className="text-xs text-miau-muted mb-1">Offering Date</p>
                  <p className="text-xl font-bold text-miau-white">Sep 2025</p>
                  <p className="text-xs text-miau-muted mt-1">Round 1 of 4</p>
                </div>
              </div>

              {/* Score progression */}
              <div className="bg-miau-dark-card rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-miau-white">Miau Creator Score Progression</p>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tierBadge(creator.scoreTier)}`}>
                    Current: {creator.score}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-miau-muted">74</span>
                    <span className="text-xs text-miau-muted/60">(Launch)</span>
                  </div>
                  <div className="flex-1 h-2 bg-miau-taupe rounded-full relative overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full transition-all"
                      style={{ width: `${creator.score}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-bold text-miau-white">{creator.score}</span>
                    <span className="text-xs text-miau-muted/60">(Current)</span>
                  </div>
                </div>
              </div>

              {/* Contract & verification */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-miau-dark-surface rounded-xl p-4">
                  <p className="text-xs text-miau-muted mb-2">Contract Address</p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono text-miau-white bg-miau-dark-card px-3 py-1.5 rounded-lg border border-miau-dark-border">
                      0x7a3b...f91c
                    </code>
                    <button
                      onClick={() => showToast('Contract address copied!')}
                      className="text-xs text-miau-pink hover:text-miau-white transition-colors"
                    >
                      <ExternalLink size={14} />
                    </button>
                  </div>
                </div>
                <div className="bg-miau-dark-surface rounded-xl p-4 space-y-2">
                  <p className="text-xs text-miau-muted mb-2">Eligibility Verification</p>
                  <div className="space-y-1.5">
                    {[
                      'Identity verified (KYC)',
                      'Revenue verification complete',
                      'Platform content policy compliant',
                      'Smart contract audited',
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-miau-white">
                        <CheckCircle2 size={13} className="text-miau-success shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Section 7: Fan Staking Benefits ── */}
          <div className="bg-miau-dark-card border border-miau-dark-border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-miau-dark-border">
              <h2 className="font-bold text-lg text-miau-white">Fan Staking Benefits</h2>
              <p className="text-xs text-miau-muted mt-1">
                Stake MIAU to unlock exclusive fan benefits from {creator.name}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-miau-dark-border bg-miau-dark-surface/40">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-miau-muted">Tier</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-miau-muted">Minimum Stake</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-miau-muted">Benefits</th>
                  </tr>
                </thead>
                <tbody>
                  {stakingTiers.map((tier, idx) => (
                    <tr key={idx} className="border-b border-miau-dark-border/30 hover:bg-miau-dark-hover/30 transition-colors">
                      <td className="px-5 py-3">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          tier.name === 'Diamond' ? 'bg-gradient-to-r from-blue-400 to-cyan-400 text-miau-white' :
                          tier.name === 'Platinum' ? 'bg-gradient-to-r from-indigo-400 to-purple-500 text-miau-white' :
                          tier.name === 'Gold' ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-miau-white' :
                          tier.name === 'Silver' ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800' :
                          'bg-gradient-to-r from-amber-600 to-amber-700 text-miau-white'
                        }`}>
                          {tier.name}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-mono font-semibold text-miau-white">{tier.amount}</td>
                      <td className="px-5 py-3">
                        <ul className="space-y-1">
                          {tier.benefits.map((b, i) => (
                            <li key={i} className="flex items-center gap-1.5 text-xs text-miau-muted">
                              <CheckCircle2 size={11} className="text-miau-success shrink-0" />
                              {b}
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ─── Section 8: Compact Order Book ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Asks (Sell orders) */}
            <div className="bg-miau-dark-card border border-miau-dark-border rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-miau-dark-border flex items-center justify-between">
                <h3 className="font-bold text-miau-white">Top 5 Asks (Sell Orders)</h3>
                <span className="text-xs text-miau-muted font-mono">{creator.catSymbol}/MIAU</span>
              </div>
              <div className="grid grid-cols-3 px-5 py-2 text-[11px] text-miau-muted font-medium border-b border-miau-dark-border/50">
                <span>Price (MIAU)</span>
                <span className="text-right">Qty</span>
                <span className="text-right">Total</span>
              </div>
              <div className="divide-y divide-transparent">
                {askOrders.slice(-5).reverse().map((order, idx) => (
                  <div
                    key={`ask-${idx}`}
                    className="relative grid grid-cols-3 px-5 py-2 text-xs font-mono"
                  >
                    <div
                      className="absolute inset-y-0 right-0 bg-red-100/60"
                      style={{ width: `${(order.quantity / maxAskQty) * 100}%` }}
                    />
                    <span className="relative text-miau-error font-medium">{order.price.toFixed(1)}</span>
                    <span className="relative text-right text-miau-white">{order.quantity}</span>
                    <span className="relative text-right text-miau-muted">{order.total.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bids (Buy orders) */}
            <div className="bg-miau-dark-card border border-miau-dark-border rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-miau-dark-border flex items-center justify-between">
                <h3 className="font-bold text-miau-white">Top 5 Bids (Buy Orders)</h3>
                <span className="text-xs text-miau-muted font-mono">{creator.catSymbol}/MIAU</span>
              </div>
              <div className="grid grid-cols-3 px-5 py-2 text-[11px] text-miau-muted font-medium border-b border-miau-dark-border/50">
                <span>Price (MIAU)</span>
                <span className="text-right">Qty</span>
                <span className="text-right">Total</span>
              </div>
              <div className="divide-y divide-transparent">
                {bidOrders.slice(0, 5).map((order, idx) => (
                  <div
                    key={`bid-${idx}`}
                    className="relative grid grid-cols-3 px-5 py-2 text-xs font-mono"
                  >
                    <div
                      className="absolute inset-y-0 right-0 bg-pink-100/60"
                      style={{ width: `${(order.quantity / maxBidQty) * 100}%` }}
                    />
                    <span className="relative text-miau-success font-medium">{order.price.toFixed(1)}</span>
                    <span className="relative text-right text-miau-white">{order.quantity}</span>
                    <span className="relative text-right text-miau-muted">{order.total.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ─── Section 9: Holder Distribution ── */}
          <div className="bg-miau-dark-card border border-miau-dark-border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-miau-dark-border">
              <h2 className="font-bold text-lg text-miau-white">Holder Distribution</h2>
            </div>
            <div className="p-5">
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Donut chart */}
                <div className="w-64 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={holderDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {holderDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: '#141428',
                          border: '1px solid #2A2A4A',
                          borderRadius: '12px',
                          fontSize: '12px',
                      color: '#FFFFFF',
                        }}
                        formatter={(value: any) => [`${value ?? 0} CATs`, '']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend */}
                <div className="flex-1 space-y-3">
                  {holderDistributionData.map((entry, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full shrink-0"
                        style={{ backgroundColor: entry.color }}
                      />
                      <div className="flex-1 flex items-center justify-between">
                        <span className="text-sm text-miau-white">{entry.name}</span>
                        <span className="text-sm font-mono font-semibold text-miau-white">{entry.value} CATs</span>
                      </div>
                    </div>
                  ))}
                  <div className="border-t border-miau-dark-border pt-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-miau-white">Total Issued</span>
                    <span className="text-sm font-mono font-bold text-miau-white">{creator.catsIssued} CATs</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ═══════════════════════════════════════
         CREATOR VIEW
         ═══════════════════════════════════════ */}
      {isCreatorView && (
        <motion.div
          key="creator-view"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* ─── Section 1: Revenue & CAT Performance ── */}
          <div className="bg-miau-dark-card border border-miau-dark-border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-miau-dark-border flex items-center gap-2">
              <BarChart3 size={18} className="text-miau-pink" />
              <h2 className="font-bold text-lg text-miau-white">Revenue & CAT Performance</h2>
            </div>
            <div className="p-5 space-y-5">
              {/* Revenue summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-miau-dark-card rounded-xl p-4">
                  <p className="text-xs text-miau-muted mb-1">This Week Revenue</p>
                  <p className="text-2xl font-bold text-miau-white">${thisWeekRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-miau-dark-surface rounded-xl p-4">
                  <p className="text-xs text-miau-muted mb-1">Net After {platformFeePercent}% Platform Fee</p>
                  <p className="text-2xl font-bold text-miau-white">${netAfterPlatformFee.toLocaleString()}</p>
                </div>
                <div className="bg-miau-dark-surface rounded-xl p-4">
                  <p className="text-xs text-miau-muted mb-1">Creator Share ({creatorSharePercent}%)</p>
                  <p className="text-2xl font-bold text-miau-success">${creatorShare.toLocaleString()}</p>
                </div>
                <div className="bg-miau-dark-surface rounded-xl p-4">
                  <p className="text-xs text-miau-muted mb-1">CAT Holder Dist ({catHolderPercent}%)</p>
                  <p className="text-2xl font-bold text-miau-pink">${catHolderShare.toLocaleString()}</p>
                </div>
              </div>

              {/* Distribution details */}
              <div className="bg-miau-cream rounded-xl p-5 space-y-3">
                <h3 className="font-semibold text-sm text-miau-white">Distribution Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-miau-muted">Distribution frequency</span>
                    <span className="font-medium text-miau-white">Weekly (every Monday)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-miau-muted">Distribution currency</span>
                    <span className="font-medium text-miau-white">ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-miau-muted">Next distribution date</span>
                    <span className="font-medium text-miau-white">Mon 24 Feb 2026</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-miau-muted">Estimated per CAT</span>
                    <span className="font-mono font-medium text-miau-white">{estimatedPerCAT} ETH</span>
                  </div>
                </div>
                <div className="bg-miau-dark-surface/60 rounded-lg p-3 flex items-start gap-2 mt-2">
                  <Info size={14} className="text-miau-muted shrink-0 mt-0.5" />
                  <p className="text-xs text-miau-muted leading-relaxed">
                    Distributions are automatically converted to ETH and sent to all CAT holder wallets every Monday.
                    The {catHolderPercent}% is split equally across all {creator.catsIssued} CATs regardless of edition.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Section 2: Buyback Options ──── */}
          <div className="bg-miau-dark-card border border-miau-dark-border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-miau-dark-border flex items-center gap-2">
              <RefreshCw size={18} className="text-miau-pink" />
              <h2 className="font-bold text-lg text-miau-white">Buyback Options</h2>
            </div>
            <div className="p-5 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Open Market Buyback */}
                <div className="bg-miau-dark-surface rounded-xl p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-miau-dark/10 flex items-center justify-center">
                      <DollarSign size={16} className="text-miau-pink" />
                    </div>
                    <h3 className="font-semibold text-sm text-miau-white">Open Market Buyback</h3>
                  </div>
                  <p className="text-xs text-miau-muted leading-relaxed">
                    Purchase your own CATs on the open market at current market prices. No restrictions,
                    available at any time. Purchased CATs can be burned (reducing supply) or held in your treasury.
                  </p>
                  <div className="bg-miau-dark-card rounded-lg p-3">
                    <p className="text-xs text-miau-muted">Current estimated cost (all {creator.catsIssued} CATs)</p>
                    <p className="text-lg font-bold text-miau-white">~{(creator.catsIssued * creator.currentPrice).toLocaleString()} MIAU</p>
                  </div>
                </div>

                {/* Structured Buyback Programme */}
                <div className="bg-miau-dark-card rounded-xl p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-miau-dark/10 flex items-center justify-center">
                      <Shield size={16} className="text-miau-pink" />
                    </div>
                    <h3 className="font-semibold text-sm text-miau-white">Structured Buyback Programme</h3>
                  </div>
                  <p className="text-xs text-miau-muted leading-relaxed">
                    Available after 12 months from initial offering. Allows you to repurchase all outstanding
                    CATs at a structured price when certain conditions are met.
                  </p>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-miau-muted">
                      <Clock size={12} className="text-miau-warning shrink-0" />
                      <span>Eligibility: After 12 months (Sep 2026)</span>
                    </div>
                    <div className="flex items-center gap-2 text-miau-muted">
                      <FileText size={12} className="text-miau-pink shrink-0" />
                      <span>Price conditions: Must meet min. floor price + premium</span>
                    </div>
                    <div className="flex items-center gap-2 text-miau-muted">
                      <Calendar size={12} className="text-miau-pink shrink-0" />
                      <span>30-day notice window required for holders</span>
                    </div>
                  </div>
                  <div className="bg-miau-dark-card rounded-lg p-3">
                    <p className="text-xs text-miau-muted">Current buyback cost estimate</p>
                    <p className="text-lg font-bold text-miau-white">~12,000 MIAU</p>
                    <p className="text-xs text-miau-muted/60">for all {creator.catsIssued} outstanding CATs</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Section 3: Issue New CATs ────── */}
          <div className="bg-miau-dark-card border border-miau-dark-border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-miau-dark-border flex items-center gap-2">
              <Plus size={18} className="text-miau-pink" />
              <h2 className="font-bold text-lg text-miau-white">Issue New CATs</h2>
            </div>
            <div className="p-5 space-y-5">
              {/* Status banner */}
              <div className="bg-miau-success/10 border border-miau-success/20 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle2 size={18} className="text-miau-success shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-miau-white">Round 1 Complete</p>
                  <p className="text-xs text-miau-muted mt-1">
                    {creator.catsIssued} CATs issued representing {catHolderPercent}% of revenue. All Founders edition sold out.
                  </p>
                </div>
              </div>

              {/* Remaining capacity info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-miau-dark-surface rounded-xl p-4 text-center">
                  <p className="text-xs text-miau-muted mb-1">Remaining Capacity</p>
                  <p className="text-2xl font-bold text-miau-white">80 CATs</p>
                  <p className="text-xs text-miau-muted">8% additional revenue</p>
                </div>
                <div className="bg-miau-dark-surface rounded-xl p-4 text-center">
                  <p className="text-xs text-miau-muted mb-1">Rounds Remaining</p>
                  <p className="text-2xl font-bold text-miau-white">3 of 4</p>
                  <p className="text-xs text-miau-muted">Max 20% total</p>
                </div>
                <div className="bg-miau-dark-surface rounded-xl p-4 text-center">
                  <p className="text-xs text-miau-muted mb-1">Next Eligible</p>
                  <p className="text-2xl font-bold text-miau-white">Jun 2026</p>
                  <p className="text-xs text-miau-muted">6-month cooling period</p>
                </div>
              </div>

              {/* Edition structure selector */}
              <div className="bg-miau-cream rounded-xl p-5 space-y-4">
                <h3 className="font-semibold text-sm text-miau-white">Edition Structure (Next Round)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-miau-muted mb-1.5 font-medium">
                      Founders Edition (max 10)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={offeringFounders}
                      onChange={e => setOfferingFounders(e.target.value)}
                      className="w-full bg-miau-dark-card border border-miau-dark-border rounded-xl px-4 py-2.5 font-mono text-sm text-miau-white focus:outline-none focus:border-miau-pink transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-miau-muted mb-1.5 font-medium">
                      Limited Edition (max 40)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="40"
                      value={offeringLimited}
                      onChange={e => setOfferingLimited(e.target.value)}
                      className="w-full bg-miau-dark-card border border-miau-dark-border rounded-xl px-4 py-2.5 font-mono text-sm text-miau-white focus:outline-none focus:border-miau-pink transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-miau-muted mb-1.5 font-medium">
                      Standard Edition (auto-fill)
                    </label>
                    <input
                      type="number"
                      value={Math.max(0, parsedStandard)}
                      readOnly
                      className="w-full bg-miau-taupe/30 border border-miau-dark-border rounded-xl px-4 py-2.5 font-mono text-sm text-miau-muted cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing guidance */}
              <div className="bg-miau-dark-surface rounded-xl p-5 space-y-3">
                <h3 className="font-semibold text-sm text-miau-white">Pricing Guidance</h3>
                <p className="text-xs text-miau-muted leading-relaxed">
                  Based on your current revenue metrics and score progression, the suggested pricing for Round 2 is:
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-miau-dark-card rounded-lg p-3 text-center">
                    <p className="text-xs text-miau-muted">Founders</p>
                    <p className="text-lg font-bold text-miau-white">300 MIAU</p>
                    <p className="text-[10px] text-miau-success">+20% vs Round 1</p>
                  </div>
                  <div className="bg-miau-dark-card rounded-lg p-3 text-center">
                    <p className="text-xs text-miau-muted">Limited</p>
                    <p className="text-lg font-bold text-miau-white">150 MIAU</p>
                    <p className="text-[10px] text-miau-success">+25% vs Round 1</p>
                  </div>
                  <div className="bg-miau-dark-card rounded-lg p-3 text-center">
                    <p className="text-xs text-miau-muted">Standard</p>
                    <p className="text-lg font-bold text-miau-white">110 MIAU</p>
                    <p className="text-[10px] text-miau-success">+37% vs Round 1</p>
                  </div>
                </div>
              </div>

              {/* Listing tier selector */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-miau-white">Listing Tier</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {listingTiers.map(tier => (
                    <button
                      key={tier.name}
                      onClick={() => setListingTier(tier.name)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        listingTier === tier.name
                          ? 'border-miau-dark bg-miau-dark-card'
                          : 'border-miau-dark-border bg-miau-dark-card hover:border-miau-pink'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-sm text-miau-white">{tier.name}</span>
                        <span className="font-mono font-bold text-sm text-miau-pink">{tier.price}</span>
                      </div>
                      <p className="text-xs text-miau-muted">{tier.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Estimated raise calculator */}
              <div className="bg-gradient-to-r from-miau-blush to-miau-pale rounded-xl p-5">
                <h3 className="font-semibold text-sm text-miau-white mb-3">Estimated Raise Calculator</h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
                  <div>
                    <p className="text-xs text-miau-muted">Founders ({parsedFounders} x 280)</p>
                    <p className="font-mono font-bold text-miau-white">{(parsedFounders * 280).toLocaleString()} MIAU</p>
                  </div>
                  <div>
                    <p className="text-xs text-miau-muted">Limited ({parsedLimited} x 140)</p>
                    <p className="font-mono font-bold text-miau-white">{(parsedLimited * 140).toLocaleString()} MIAU</p>
                  </div>
                  <div>
                    <p className="text-xs text-miau-muted">Standard ({Math.max(0, parsedStandard)} x 100)</p>
                    <p className="font-mono font-bold text-miau-white">{(Math.max(0, parsedStandard) * 100).toLocaleString()} MIAU</p>
                  </div>
                  <div className="bg-miau-dark-card rounded-lg p-3">
                    <p className="text-xs text-miau-muted">Total Estimated</p>
                    <p className="text-xl font-bold text-miau-pink">{estimatedRaise.toLocaleString()} MIAU</p>
                  </div>
                </div>
              </div>

              {/* Submit button */}
              <button
                onClick={() => {
                  setShowOfferingModal(true);
                  setOfferingSubmitted(false);
                }}
                className="w-full py-3.5 bg-miau-dark text-miau-white rounded-xl font-semibold text-sm hover:bg-miau-brown transition-colors flex items-center justify-center gap-2"
              >
                <FileText size={16} />
                Submit New Offering for Review
              </button>
            </div>
          </div>

          {/* ─── CAT Offering Application Modal ── */}
          <AnimatePresence>
            {showOfferingModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                onClick={() => setShowOfferingModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-miau-dark-card rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
                  onClick={e => e.stopPropagation()}
                >
                  {/* Modal header */}
                  <div className="px-6 py-5 border-b border-miau-dark-border flex items-center justify-between sticky top-0 bg-miau-dark-card rounded-t-3xl z-10">
                    <div>
                      <h2 className="font-bold text-lg text-miau-white">
                        CAT Offering Application
                      </h2>
                      <p className="text-xs text-miau-muted mt-0.5">
                        {creator.name} - New CAT Issuance
                      </p>
                    </div>
                    <button
                      onClick={() => setShowOfferingModal(false)}
                      className="w-8 h-8 rounded-lg bg-miau-dark-surface flex items-center justify-center hover:bg-miau-dark-hover transition-colors"
                    >
                      <X size={16} className="text-miau-white" />
                    </button>
                  </div>

                  {!offeringSubmitted ? (
                    <div className="p-6 space-y-5">
                      {/* Round info */}
                      <div className="bg-miau-dark-surface rounded-xl p-4 flex items-center justify-between">
                        <span className="text-sm font-medium text-miau-white">Round</span>
                        <span className="font-semibold text-miau-pink">Round 2 of 4</span>
                      </div>

                      {/* Edition split inputs */}
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-miau-white">Edition Split</h3>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs text-miau-muted mb-1">Founders (max 10)</label>
                            <input
                              type="number"
                              min="0"
                              max="10"
                              value={offeringFounders}
                              onChange={e => setOfferingFounders(e.target.value)}
                              className="w-full bg-miau-dark-surface border border-miau-dark-border rounded-xl px-3 py-2 font-mono text-sm text-miau-white focus:outline-none focus:border-miau-pink"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-miau-muted mb-1">Limited (max 40)</label>
                            <input
                              type="number"
                              min="0"
                              max="40"
                              value={offeringLimited}
                              onChange={e => setOfferingLimited(e.target.value)}
                              className="w-full bg-miau-dark-surface border border-miau-dark-border rounded-xl px-3 py-2 font-mono text-sm text-miau-white focus:outline-none focus:border-miau-pink"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-miau-muted mb-1">Standard (auto)</label>
                            <input
                              type="number"
                              value={Math.max(0, parsedStandard)}
                              readOnly
                              className="w-full bg-miau-taupe/30 border border-miau-dark-border rounded-xl px-3 py-2 font-mono text-sm text-miau-muted cursor-not-allowed"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Suggested pricing */}
                      <div className="bg-miau-dark-card rounded-xl p-4 space-y-2">
                        <h3 className="text-sm font-semibold text-miau-white">Suggested Pricing</h3>
                        <div className="grid grid-cols-3 gap-3 text-center text-xs">
                          <div>
                            <span className="text-miau-muted">Founders</span>
                            <p className="font-mono font-bold text-miau-white">300 MIAU</p>
                          </div>
                          <div>
                            <span className="text-miau-muted">Limited</span>
                            <p className="font-mono font-bold text-miau-white">150 MIAU</p>
                          </div>
                          <div>
                            <span className="text-miau-muted">Standard</span>
                            <p className="font-mono font-bold text-miau-white">110 MIAU</p>
                          </div>
                        </div>
                      </div>

                      {/* Listing tier radio buttons */}
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-miau-white">Listing Tier</h3>
                        <div className="space-y-2">
                          {listingTiers.map(tier => (
                            <label
                              key={tier.name}
                              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                listingTier === tier.name
                                  ? 'border-miau-dark bg-miau-dark-card'
                                  : 'border-miau-dark-border bg-miau-dark-card hover:border-miau-pink'
                              }`}
                            >
                              <input
                                type="radio"
                                name="listingTier"
                                value={tier.name}
                                checked={listingTier === tier.name}
                                onChange={e => setListingTier(e.target.value)}
                                className="accent-miau-dark"
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-miau-white">{tier.name}</span>
                                  <span className="font-mono text-sm font-bold text-miau-pink">{tier.price}</span>
                                </div>
                                <p className="text-xs text-miau-muted">{tier.description}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Capital use textarea */}
                      <div>
                        <label className="block text-sm font-semibold text-miau-white mb-1.5">
                          Intended Use of Capital
                        </label>
                        <textarea
                          value={capitalUse}
                          onChange={e => setCapitalUse(e.target.value)}
                          placeholder="Describe how you plan to use the raised capital to grow your platform and content..."
                          className="w-full bg-miau-dark-surface border border-miau-dark-border rounded-xl px-4 py-3 text-sm text-miau-white placeholder:text-miau-muted/60 focus:outline-none focus:border-miau-pink transition-colors resize-none h-24"
                        />
                      </div>

                      {/* Growth projections textarea */}
                      <div>
                        <label className="block text-sm font-semibold text-miau-white mb-1.5">
                          Growth Projections
                        </label>
                        <textarea
                          value={growthProjections}
                          onChange={e => setGrowthProjections(e.target.value)}
                          placeholder="Outline your subscriber growth and revenue projections for the next 12 months..."
                          className="w-full bg-miau-dark-surface border border-miau-dark-border rounded-xl px-4 py-3 text-sm text-miau-white placeholder:text-miau-muted/60 focus:outline-none focus:border-miau-pink transition-colors resize-none h-24"
                        />
                      </div>

                      {/* Lock-up confirmation checkbox */}
                      <label className="flex items-start gap-3 p-3 bg-miau-dark-surface rounded-xl cursor-pointer">
                        <input
                          type="checkbox"
                          checked={lockUpConfirmed}
                          onChange={e => setLockUpConfirmed(e.target.checked)}
                          className="mt-0.5 accent-miau-dark"
                        />
                        <div>
                          <p className="text-sm font-medium text-miau-white">Lock-up Confirmation</p>
                          <p className="text-xs text-miau-muted mt-0.5">
                            I confirm that I understand the 12-month lock-up period during which structured buyback
                            is not available, and that CAT holders have ongoing revenue distribution rights.
                          </p>
                        </div>
                      </label>

                      {/* Declaration checkbox */}
                      <label className="flex items-start gap-3 p-3 bg-miau-dark-surface rounded-xl cursor-pointer">
                        <input
                          type="checkbox"
                          checked={declarationConfirmed}
                          onChange={e => setDeclarationConfirmed(e.target.checked)}
                          className="mt-0.5 accent-miau-dark"
                        />
                        <div>
                          <p className="text-sm font-medium text-miau-white">Declaration</p>
                          <p className="text-xs text-miau-muted mt-0.5">
                            I declare that all information provided is accurate and complete. I understand that Miauswap
                            reserves the right to reject this application, and that issuance is subject to platform
                            review and community governance approval.
                          </p>
                        </div>
                      </label>

                      {/* Submit button */}
                      <button
                        onClick={() => setOfferingSubmitted(true)}
                        disabled={!lockUpConfirmed || !declarationConfirmed}
                        className="w-full py-3.5 bg-miau-dark text-miau-white rounded-xl font-semibold text-sm hover:bg-miau-brown transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <ArrowUpRight size={16} />
                        Submit Application
                      </button>
                    </div>
                  ) : (
                    /* ── Success state ───────────── */
                    <div className="p-8 text-center space-y-5">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                      >
                        <div className="w-20 h-20 rounded-full bg-miau-success/10 flex items-center justify-center mx-auto">
                          <CheckCircle2 size={40} className="text-miau-success" />
                        </div>
                      </motion.div>
                      <div>
                        <h3 className="text-xl font-extrabold text-miau-white">
                          Application Submitted
                        </h3>
                        <p className="text-sm text-miau-muted mt-2 max-w-md mx-auto leading-relaxed">
                          Your CAT offering application has been submitted for review. Our team will
                          evaluate your application against our listing criteria.
                        </p>
                      </div>
                      <div className="bg-miau-dark-surface rounded-xl p-4 inline-block">
                        <p className="text-xs text-miau-muted">Typical review time</p>
                        <p className="text-lg font-bold text-miau-white">7 -- 14 days</p>
                      </div>
                      <div className="space-y-2 text-xs text-miau-muted">
                        <p>You will receive an email notification when your application status changes.</p>
                        <p>Application reference: <span className="font-mono font-medium text-miau-white">APP-{creator.id}-R2-{Date.now().toString(36).toUpperCase().slice(0, 6)}</span></p>
                      </div>
                      <button
                        onClick={() => setShowOfferingModal(false)}
                        className="px-6 py-2.5 bg-miau-dark text-miau-white rounded-xl font-semibold text-sm hover:bg-miau-brown transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
