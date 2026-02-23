'use client';

import React, { useState, useMemo, useCallback } from 'react';
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
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Search,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  X,
  AlertTriangle,
  Loader2,
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  creators,
  askOrders,
  bidOrders,
  recentTrades,
  generatePriceData,
  type Creator,
  type OrderBookEntry,
  type OpenOrder,
} from '@/lib/dummyData';
import { useApp } from '@/context/AppContext';

/* ───────────────────────────────────────────
   Time-range options for the price chart
   ─────────────────────────────────────────── */
const timeRanges = [
  { label: '1H', days: 1 / 24 },
  { label: '6H', days: 0.25 },
  { label: '24H', days: 1 },
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: 'ALL', days: 180 },
] as const;

/* ───────────────────────────────────────────
   Score tier badge colour helper
   ─────────────────────────────────────────── */
function tierBadge(tier: Creator['scoreTier']) {
  switch (tier) {
    case 'Platinum':
      return 'bg-gradient-to-r from-indigo-400 to-purple-500 text-white';
    case 'Gold':
      return 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white';
    case 'Silver':
      return 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800';
  }
}

/* ═══════════════════════════════════════════
   TRADE PAGE
   ═══════════════════════════════════════════ */
export default function TradePage() {
  const {
    walletAddress,
    miauBalance,
    setMiauBalance,
    feeDiscount,
    stakingTier,
    openOrders,
    addOrder,
    cancelOrder,
    showToast,
    selectedCreatorSlug,
    setSelectedCreatorSlug,
  } = useApp();

  /* ── Creator selection ─────────────────── */
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [selectorSearch, setSelectorSearch] = useState('');

  const selectedCreator = useMemo(
    () => creators.find(c => c.slug === selectedCreatorSlug) ?? creators[0],
    [selectedCreatorSlug],
  );

  const filteredCreators = useMemo(
    () =>
      creators.filter(
        c =>
          c.name.toLowerCase().includes(selectorSearch.toLowerCase()) ||
          c.catSymbol.toLowerCase().includes(selectorSearch.toLowerCase()),
      ),
    [selectorSearch],
  );

  /* ── Chart state ───────────────────────── */
  const [activeRange, setActiveRange] = useState<string>('7D');

  const chartData = useMemo(() => {
    const range = timeRanges.find(r => r.label === activeRange) ?? timeRanges[3];
    return generatePriceData(selectedCreator.currentPrice, range.days, 0.06);
  }, [selectedCreator, activeRange]);

  /* ── Trade form state ──────────────────── */
  const [tradeSide, setTradeSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'limit' | 'market'>('limit');
  const [tradePrice, setTradePrice] = useState(selectedCreator.currentPrice.toString());
  const [tradeQuantity, setTradeQuantity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* Recalculate price when creator changes (if user hasn't manually edited) */
  const handleCreatorSelect = useCallback(
    (slug: string) => {
      setSelectedCreatorSlug(slug);
      const c = creators.find(cr => cr.slug === slug);
      if (c) setTradePrice(c.currentPrice.toString());
      setSelectorOpen(false);
      setSelectorSearch('');
    },
    [setSelectedCreatorSlug],
  );

  /* Pre-fill price from order-book click */
  const handleOrderBookPriceClick = useCallback((price: number) => {
    setTradePrice(price.toString());
    setOrderType('limit');
  }, []);

  /* Derived trade values */
  const parsedPrice = parseFloat(tradePrice) || 0;
  const parsedQuantity = parseFloat(tradeQuantity) || 0;
  const rawTotal = parsedPrice * parsedQuantity;
  const baseFeeRate = 0.0025; // 0.25 %
  const discountMultiplier = 1 - feeDiscount / 100;
  const effectiveFeeRate = baseFeeRate * discountMultiplier;
  const feeAmount = rawTotal * effectiveFeeRate;
  const totalWithFee = tradeSide === 'buy' ? rawTotal + feeAmount : rawTotal - feeAmount;

  const lowBalanceWarning = miauBalance < 1100;

  /* ── Submit order ──────────────────────── */
  const handleSubmitOrder = useCallback(async () => {
    if (parsedQuantity <= 0 || (orderType === 'limit' && parsedPrice <= 0)) return;
    if (tradeSide === 'buy' && totalWithFee > miauBalance) {
      showToast('Insufficient MIAU balance for this order.');
      return;
    }

    setIsSubmitting(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1200));

    const newOrder: OpenOrder = {
      id: `ord-${Date.now()}`,
      pair: `${selectedCreator.catSymbol}/MIAU`,
      type: orderType === 'limit' ? 'Limit' : 'Market',
      side: tradeSide === 'buy' ? 'Buy' : 'Sell',
      price: orderType === 'market' ? selectedCreator.currentPrice : parsedPrice,
      quantity: parsedQuantity,
      filled: 0,
      status: 'Pending',
    };

    addOrder(newOrder);

    // Deduct balance for buy orders
    if (tradeSide === 'buy') {
      setMiauBalance(Math.round((miauBalance - totalWithFee) * 100) / 100);
    }

    showToast(
      `${tradeSide === 'buy' ? 'Buy' : 'Sell'} order placed: ${parsedQuantity} ${selectedCreator.catSymbol} @ ${orderType === 'market' ? 'Market' : parsedPrice + ' MIAU'}`,
    );

    setTradeQuantity('');
    setIsSubmitting(false);
  }, [
    parsedQuantity,
    parsedPrice,
    orderType,
    tradeSide,
    totalWithFee,
    miauBalance,
    selectedCreator,
    addOrder,
    setMiauBalance,
    showToast,
  ]);

  /* ── Cancel confirmation ───────────────── */
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);

  const handleCancelOrder = useCallback(
    (id: string) => {
      const order = openOrders.find(o => o.id === id);
      cancelOrder(id);
      setCancelConfirmId(null);
      if (order && order.side === 'Buy') {
        const refund = order.price * (order.quantity - order.filled);
        setMiauBalance(Math.round((miauBalance + refund) * 100) / 100);
      }
      showToast('Order cancelled successfully.');
    },
    [cancelOrder, openOrders, miauBalance, setMiauBalance, showToast],
  );

  /* ── Order-book depth helpers ──────────── */
  const maxAskQty = useMemo(() => Math.max(...askOrders.map(o => o.quantity)), []);
  const maxBidQty = useMemo(() => Math.max(...bidOrders.map(o => o.quantity)), []);

  /* Last trade price (spread indicator) */
  const lastTradePrice = recentTrades.length > 0 ? recentTrades[0].price : selectedCreator.currentPrice;
  const spreadAsk = askOrders.length > 0 ? askOrders[askOrders.length - 1].price : lastTradePrice;
  const spreadBid = bidOrders.length > 0 ? bidOrders[0].price : lastTradePrice;
  const spreadValue = Math.round((spreadAsk - spreadBid) * 100) / 100;
  const spreadPercent = Math.round((spreadValue / lastTradePrice) * 10000) / 100;

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */
  return (
    <div className="space-y-4">
      {/* ─── CAT Selector Dropdown ─────────── */}
      <div className="relative">
        <button
          onClick={() => setSelectorOpen(!selectorOpen)}
          className="w-full md:w-auto flex items-center gap-3 bg-white border border-miau-taupe rounded-2xl px-4 py-3 hover:border-miau-pink transition-colors"
        >
          {/* Creator avatar */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
            style={{
              background: `linear-gradient(135deg, ${selectedCreator.gradientFrom}, ${selectedCreator.gradientTo})`,
            }}
          >
            {selectedCreator.initials}
          </div>

          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2">
              <span className="font-serif font-semibold text-miau-brown">
                {selectedCreator.catSymbol}
              </span>
              <span className="text-xs text-miau-rose-brown">/MIAU</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tierBadge(selectedCreator.scoreTier)}`}>
                {selectedCreator.score}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-semibold text-miau-brown">
                {selectedCreator.currentPrice.toFixed(2)} MIAU
              </span>
              <span
                className={`text-xs font-medium flex items-center gap-0.5 ${
                  selectedCreator.priceChange24h >= 0 ? 'text-miau-success' : 'text-miau-error'
                }`}
              >
                {selectedCreator.priceChange24h >= 0 ? (
                  <TrendingUp size={12} />
                ) : (
                  <TrendingDown size={12} />
                )}
                {selectedCreator.priceChange24h >= 0 ? '+' : ''}
                {selectedCreator.priceChange24h.toFixed(1)}%
              </span>
            </div>
          </div>

          <ChevronDown
            size={18}
            className={`ml-auto text-miau-rose-brown transition-transform ${selectorOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Dropdown */}
        <AnimatePresence>
          {selectorOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 top-full left-0 mt-2 w-full md:w-[480px] bg-white border border-miau-taupe rounded-2xl shadow-xl overflow-hidden"
            >
              {/* Search */}
              <div className="p-3 border-b border-miau-taupe">
                <div className="flex items-center gap-2 bg-miau-pale rounded-xl px-3 py-2">
                  <Search size={16} className="text-miau-rose-brown" />
                  <input
                    type="text"
                    value={selectorSearch}
                    onChange={e => setSelectorSearch(e.target.value)}
                    placeholder="Search creators or CAT symbols..."
                    className="bg-transparent text-sm text-miau-brown placeholder-miau-rose-brown outline-none w-full"
                    autoFocus
                  />
                  {selectorSearch && (
                    <button onClick={() => setSelectorSearch('')}>
                      <X size={14} className="text-miau-rose-brown" />
                    </button>
                  )}
                </div>
              </div>

              {/* Creator list */}
              <div className="max-h-80 overflow-y-auto">
                {filteredCreators.length === 0 ? (
                  <p className="p-4 text-sm text-miau-rose-brown text-center">No creators found.</p>
                ) : (
                  filteredCreators.map(c => (
                    <button
                      key={c.id}
                      onClick={() => handleCreatorSelect(c.slug)}
                      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-miau-pale transition-colors ${
                        c.slug === selectedCreatorSlug ? 'bg-miau-blush' : ''
                      }`}
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${c.gradientFrom}, ${c.gradientTo})`,
                        }}
                      >
                        {c.initials}
                      </div>
                      <div className="flex flex-col items-start flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-miau-brown">{c.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${tierBadge(c.scoreTier)}`}>
                            {c.score}
                          </span>
                        </div>
                        <span className="text-xs text-miau-rose-brown">{c.catSymbol}/MIAU</span>
                      </div>
                      <div className="flex flex-col items-end shrink-0">
                        <span className="font-mono text-sm font-semibold text-miau-brown">
                          {c.currentPrice.toFixed(2)}
                        </span>
                        <span
                          className={`text-xs font-medium ${
                            c.priceChange24h >= 0 ? 'text-miau-success' : 'text-miau-error'
                          }`}
                        >
                          {c.priceChange24h >= 0 ? '+' : ''}
                          {c.priceChange24h.toFixed(1)}%
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Backdrop for closing */}
        {selectorOpen && (
          <div className="fixed inset-0 z-40" onClick={() => setSelectorOpen(false)} />
        )}
      </div>

      {/* ─── Three-Column Grid ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ═══════════════════════════════════════
           LEFT COLUMN — Order Book
           ═══════════════════════════════════════ */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-miau-taupe rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-miau-taupe flex items-center justify-between">
              <h2 className="font-serif font-semibold text-miau-brown">Order Book</h2>
              <span className="text-xs text-miau-rose-brown font-mono">
                {selectedCreator.catSymbol}/MIAU
              </span>
            </div>

            {/* Column labels */}
            <div className="grid grid-cols-3 px-4 py-2 text-[11px] text-miau-rose-brown font-medium border-b border-miau-taupe/50">
              <span>Price (MIAU)</span>
              <span className="text-right">Qty</span>
              <span className="text-right">Total</span>
            </div>

            {/* ASK side — reversed so lowest price is near the spread */}
            <div className="divide-y divide-transparent">
              {[...askOrders].reverse().map((order, idx) => (
                <button
                  key={`ask-${idx}`}
                  onClick={() => handleOrderBookPriceClick(order.price)}
                  className="relative w-full grid grid-cols-3 px-4 py-1.5 text-xs font-mono hover:bg-red-50/80 transition-colors cursor-pointer"
                >
                  {/* Depth bar */}
                  <div
                    className="absolute inset-y-0 right-0 bg-red-100/60"
                    style={{ width: `${(order.quantity / maxAskQty) * 100}%` }}
                  />
                  <span className="relative text-miau-error font-medium">{order.price.toFixed(1)}</span>
                  <span className="relative text-right text-miau-brown">{order.quantity}</span>
                  <span className="relative text-right text-miau-rose-brown">
                    {order.total.toLocaleString()}
                  </span>
                </button>
              ))}
            </div>

            {/* Spread indicator */}
            <div className="px-4 py-2.5 bg-miau-pale/60 border-y border-miau-taupe/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowUpDown size={14} className="text-miau-rose-brown" />
                <span className="font-mono font-bold text-sm text-miau-brown">
                  {lastTradePrice.toFixed(2)}
                </span>
                <span
                  className={`text-xs font-medium ${
                    selectedCreator.priceChange24h >= 0 ? 'text-miau-success' : 'text-miau-error'
                  }`}
                >
                  {selectedCreator.priceChange24h >= 0 ? '+' : ''}
                  {selectedCreator.priceChange24h.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-miau-rose-brown">
                <span>Spread</span>
                <span className="font-mono font-medium">{spreadValue.toFixed(2)}</span>
                <span className="text-miau-grey">({spreadPercent}%)</span>
              </div>
            </div>

            {/* BID side */}
            <div className="divide-y divide-transparent">
              {bidOrders.map((order, idx) => (
                <button
                  key={`bid-${idx}`}
                  onClick={() => handleOrderBookPriceClick(order.price)}
                  className="relative w-full grid grid-cols-3 px-4 py-1.5 text-xs font-mono hover:bg-pink-50/80 transition-colors cursor-pointer"
                >
                  {/* Depth bar */}
                  <div
                    className="absolute inset-y-0 right-0 bg-pink-100/60"
                    style={{ width: `${(order.quantity / maxBidQty) * 100}%` }}
                  />
                  <span className="relative text-miau-success font-medium">{order.price.toFixed(1)}</span>
                  <span className="relative text-right text-miau-brown">{order.quantity}</span>
                  <span className="relative text-right text-miau-rose-brown">
                    {order.total.toLocaleString()}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════
           CENTRE COLUMN — Chart + Trade Entry
           ═══════════════════════════════════════ */}
        <div className="lg:col-span-6 space-y-4">
          {/* ── Price Chart ──────────────────── */}
          <div className="bg-white border border-miau-taupe rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-miau-taupe flex items-center justify-between flex-wrap gap-2">
              <h2 className="font-serif font-semibold text-miau-brown">
                {selectedCreator.catSymbol} Price
              </h2>

              {/* Time range buttons */}
              <div className="flex items-center gap-1">
                {timeRanges.map(r => (
                  <button
                    key={r.label}
                    onClick={() => setActiveRange(r.label)}
                    className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                      activeRange === r.label
                        ? 'bg-miau-pink text-white'
                        : 'text-miau-rose-brown hover:bg-miau-pale'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Area chart */}
            <div className="px-2 pt-4 pb-1">
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FFB2D0" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#FFB2D0" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F5EDE8" vertical={false} />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 10, fill: '#8B6B61' }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                    minTickGap={40}
                  />
                  <YAxis
                    domain={['auto', 'auto']}
                    tick={{ fontSize: 10, fill: '#8B6B61' }}
                    tickLine={false}
                    axisLine={false}
                    width={45}
                    tickFormatter={(v: number) => v.toFixed(0)}
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
                    formatter={(value: any) => [`${(value ?? 0).toFixed(2)} MIAU`, 'Price']}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#C4456B"
                    strokeWidth={2}
                    fill="url(#priceGradient)"
                    dot={false}
                    activeDot={{ r: 4, fill: '#C4456B', strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Volume bars */}
            <div className="px-2 pb-3">
              <ResponsiveContainer width="100%" height={60}>
                <BarChart data={chartData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                  <XAxis dataKey="time" hide />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      background: '#fff',
                      border: '1px solid #F5EDE8',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                    }}
                    formatter={(value: any) => [value ?? 0, 'Volume']}
                    labelStyle={{ color: '#8B6B61', fontSize: '11px' }}
                  />
                  <Bar dataKey="volume" fill="#FFB2D0" opacity={0.45} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── Trade Entry Panel ────────────── */}
          <div className="bg-white border border-miau-taupe rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-miau-taupe">
              <h2 className="font-serif font-semibold text-miau-brown">Place Order</h2>
            </div>

            <div className="p-4 space-y-4">
              {/* BUY / SELL toggle */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setTradeSide('buy')}
                  className={`py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                    tradeSide === 'buy'
                      ? 'bg-miau-success text-white'
                      : 'bg-miau-pale text-miau-rose-brown hover:bg-miau-blush'
                  }`}
                >
                  BUY
                </button>
                <button
                  onClick={() => setTradeSide('sell')}
                  className={`py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                    tradeSide === 'sell'
                      ? 'bg-miau-error text-white'
                      : 'bg-miau-pale text-miau-rose-brown hover:bg-miau-blush'
                  }`}
                >
                  SELL
                </button>
              </div>

              {/* LIMIT / MARKET toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => setOrderType('limit')}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    orderType === 'limit'
                      ? 'bg-miau-brown text-white'
                      : 'bg-miau-pale text-miau-rose-brown hover:bg-miau-blush'
                  }`}
                >
                  LIMIT
                </button>
                <button
                  onClick={() => setOrderType('market')}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    orderType === 'market'
                      ? 'bg-miau-brown text-white'
                      : 'bg-miau-pale text-miau-rose-brown hover:bg-miau-blush'
                  }`}
                >
                  MARKET
                </button>
              </div>

              {/* Price field (only for limit orders) */}
              {orderType === 'limit' && (
                <div>
                  <label className="block text-xs text-miau-rose-brown mb-1.5 font-medium">
                    Price (MIAU)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={tradePrice}
                    onChange={e => setTradePrice(e.target.value)}
                    className="w-full bg-miau-pale border border-miau-taupe rounded-xl px-4 py-2.5 font-mono text-sm text-miau-brown focus:outline-none focus:border-miau-pink transition-colors"
                    placeholder="0.00"
                  />
                </div>
              )}

              {orderType === 'market' && (
                <div className="bg-miau-pale rounded-xl px-4 py-2.5 flex items-center justify-between">
                  <span className="text-xs text-miau-rose-brown font-medium">Market Price</span>
                  <span className="font-mono text-sm font-semibold text-miau-brown">
                    {selectedCreator.currentPrice.toFixed(2)} MIAU
                  </span>
                </div>
              )}

              {/* Quantity field */}
              <div>
                <label className="block text-xs text-miau-rose-brown mb-1.5 font-medium">
                  Quantity ({selectedCreator.catSymbol})
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={tradeQuantity}
                  onChange={e => setTradeQuantity(e.target.value)}
                  className="w-full bg-miau-pale border border-miau-taupe rounded-xl px-4 py-2.5 font-mono text-sm text-miau-brown focus:outline-none focus:border-miau-pink transition-colors"
                  placeholder="0"
                />
              </div>

              {/* Auto-calculated total + fee breakdown */}
              {parsedQuantity > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-miau-pale/60 rounded-xl p-3 space-y-2 text-xs"
                >
                  <div className="flex justify-between">
                    <span className="text-miau-rose-brown">Subtotal</span>
                    <span className="font-mono text-miau-brown font-medium">
                      {rawTotal.toFixed(2)} MIAU
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-miau-rose-brown flex items-center gap-1">
                      Fee (0.25% secondary)
                      {feeDiscount > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-miau-success">
                          <Shield size={10} />
                          {stakingTier} -{feeDiscount}%
                        </span>
                      )}
                    </span>
                    <span className="font-mono text-miau-brown font-medium">
                      {feeAmount.toFixed(2)} MIAU
                    </span>
                  </div>
                  <div className="border-t border-miau-taupe pt-2 flex justify-between font-semibold">
                    <span className="text-miau-brown">
                      {tradeSide === 'buy' ? 'Total Cost' : 'You Receive'}
                    </span>
                    <span className="font-mono text-miau-brown">{totalWithFee.toFixed(2)} MIAU</span>
                  </div>
                </motion.div>
              )}

              {/* Balance display */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-miau-rose-brown">Available Balance</span>
                <span className="font-mono font-semibold text-miau-brown">
                  {miauBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MIAU
                </span>
              </div>

              {/* Low balance warning */}
              {lowBalanceWarning && (
                <div className="flex items-start gap-2 bg-miau-warning/10 border border-miau-warning/30 rounded-xl px-3 py-2.5">
                  <AlertTriangle size={16} className="text-miau-warning shrink-0 mt-0.5" />
                  <p className="text-xs text-miau-warning font-medium leading-relaxed">
                    Your MIAU balance is below 1,100. If it drops below 1,000 you will lose CDEX trading
                    access. Consider topping up soon.
                  </p>
                </div>
              )}

              {/* Submit button */}
              <button
                onClick={handleSubmitOrder}
                disabled={isSubmitting || parsedQuantity <= 0 || (orderType === 'limit' && parsedPrice <= 0)}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed ${
                  tradeSide === 'buy'
                    ? 'bg-miau-success hover:bg-miau-success/90 text-white'
                    : 'bg-miau-error hover:bg-miau-error/90 text-white'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  <>
                    {tradeSide === 'buy' ? 'Buy' : 'Sell'} {selectedCreator.catSymbol}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════
           RIGHT COLUMN — Recent Trades + Open Orders
           ═══════════════════════════════════════ */}
        <div className="lg:col-span-3 space-y-4">
          {/* ── Recent Trades ────────────────── */}
          <div className="bg-white border border-miau-taupe rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-miau-taupe">
              <h2 className="font-serif font-semibold text-miau-brown">Recent Trades</h2>
            </div>

            {/* Column labels */}
            <div className="grid grid-cols-4 px-4 py-2 text-[11px] text-miau-rose-brown font-medium border-b border-miau-taupe/50">
              <span>Time</span>
              <span className="text-right">Price</span>
              <span className="text-right">Qty</span>
              <span className="text-right">Side</span>
            </div>

            <div className="divide-y divide-miau-taupe/30">
              {recentTrades.slice(0, 15).map(trade => (
                <div
                  key={trade.id}
                  className="grid grid-cols-4 px-4 py-1.5 text-xs font-mono hover:bg-miau-pale/40 transition-colors"
                >
                  <span className="text-miau-rose-brown">{trade.time}</span>
                  <span
                    className={`text-right font-medium ${
                      trade.side === 'buy' ? 'text-miau-success' : 'text-miau-error'
                    }`}
                  >
                    {trade.price.toFixed(1)}
                  </span>
                  <span className="text-right text-miau-brown">{trade.quantity}</span>
                  <span className="text-right">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        trade.side === 'buy'
                          ? 'bg-miau-success/10 text-miau-success'
                          : 'bg-miau-error/10 text-miau-error'
                      }`}
                    >
                      {trade.side}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── My Open Orders ───────────────── */}
          <div className="bg-white border border-miau-taupe rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-miau-taupe flex items-center justify-between">
              <h2 className="font-serif font-semibold text-miau-brown">My Open Orders</h2>
              <span className="text-xs text-miau-rose-brown font-mono">{openOrders.length} active</span>
            </div>

            {openOrders.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-miau-rose-brown">No open orders.</p>
                <p className="text-xs text-miau-grey mt-1">Place an order to get started.</p>
              </div>
            ) : (
              <div className="divide-y divide-miau-taupe/30">
                {openOrders.map(order => (
                  <div key={order.id} className="px-4 py-3 space-y-2">
                    {/* Order header row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${
                            order.side === 'Buy'
                              ? 'bg-miau-success/10 text-miau-success'
                              : 'bg-miau-error/10 text-miau-error'
                          }`}
                        >
                          {order.side}
                        </span>
                        <span className="text-xs font-medium text-miau-brown">{order.pair}</span>
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
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-miau-rose-brown block text-[10px]">Price</span>
                        <span className="font-mono font-medium text-miau-brown">
                          {order.price.toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-miau-rose-brown block text-[10px]">Qty</span>
                        <span className="font-mono font-medium text-miau-brown">{order.quantity}</span>
                      </div>
                      <div>
                        <span className="text-miau-rose-brown block text-[10px]">Filled</span>
                        <span className="font-mono font-medium text-miau-brown">
                          {order.filled}/{order.quantity}
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
                            <span className="text-xs text-miau-error font-medium">Cancel this order?</span>
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
          </div>
        </div>
      </div>
    </div>
  );
}
