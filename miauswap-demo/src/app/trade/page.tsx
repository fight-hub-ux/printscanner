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
import Image from 'next/image';
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
  type OpenOrder,
} from '@/lib/dummyData';
import { useApp } from '@/context/AppContext';

const timeRanges = [
  { label: '1H', days: 1 / 24 },
  { label: '6H', days: 0.25 },
  { label: '24H', days: 1 },
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: 'ALL', days: 180 },
] as const;

function tierBadge(tier: Creator['scoreTier']) {
  switch (tier) {
    case 'Platinum':
      return 'bg-gradient-to-r from-violet-500 to-purple-600 text-miau-white';
    case 'Gold':
      return 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black';
    case 'Silver':
      return 'bg-gradient-to-r from-gray-400 to-gray-500 text-miau-white';
  }
}

export default function TradePage() {
  const {
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

  const [activeRange, setActiveRange] = useState<string>('7D');

  const chartData = useMemo(() => {
    const range = timeRanges.find(r => r.label === activeRange) ?? timeRanges[3];
    return generatePriceData(selectedCreator.currentPrice, range.days, 0.06);
  }, [selectedCreator, activeRange]);

  const [tradeSide, setTradeSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'limit' | 'market'>('limit');
  const [tradePrice, setTradePrice] = useState(selectedCreator.currentPrice.toString());
  const [tradeQuantity, setTradeQuantity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleOrderBookPriceClick = useCallback((price: number) => {
    setTradePrice(price.toString());
    setOrderType('limit');
  }, []);

  const parsedPrice = parseFloat(tradePrice) || 0;
  const parsedQuantity = parseFloat(tradeQuantity) || 0;
  const rawTotal = parsedPrice * parsedQuantity;
  const baseFeeRate = 0.0025;
  const discountMultiplier = 1 - feeDiscount / 100;
  const effectiveFeeRate = baseFeeRate * discountMultiplier;
  const feeAmount = rawTotal * effectiveFeeRate;
  const totalWithFee = tradeSide === 'buy' ? rawTotal + feeAmount : rawTotal - feeAmount;

  const lowBalanceWarning = miauBalance < 1100;

  const handleSubmitOrder = useCallback(async () => {
    if (parsedQuantity <= 0 || (orderType === 'limit' && parsedPrice <= 0)) return;
    if (tradeSide === 'buy' && totalWithFee > miauBalance) {
      showToast('Insufficient MIAU balance for this order.');
      return;
    }

    setIsSubmitting(true);
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

    if (tradeSide === 'buy') {
      setMiauBalance(Math.round((miauBalance - totalWithFee) * 100) / 100);
    }

    showToast(
      `${tradeSide === 'buy' ? 'Buy' : 'Sell'} order placed: ${parsedQuantity} ${selectedCreator.catSymbol} @ ${orderType === 'market' ? 'Market' : parsedPrice + ' MIAU'}`,
    );

    setTradeQuantity('');
    setIsSubmitting(false);
  }, [
    parsedQuantity, parsedPrice, orderType, tradeSide, totalWithFee,
    miauBalance, selectedCreator, addOrder, setMiauBalance, showToast,
  ]);

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
      showToast('Order cancelled.');
    },
    [cancelOrder, openOrders, miauBalance, setMiauBalance, showToast],
  );

  const maxAskQty = useMemo(() => Math.max(...askOrders.map(o => o.quantity)), []);
  const maxBidQty = useMemo(() => Math.max(...bidOrders.map(o => o.quantity)), []);

  const lastTradePrice = recentTrades.length > 0 ? recentTrades[0].price : selectedCreator.currentPrice;
  const spreadAsk = askOrders.length > 0 ? askOrders[askOrders.length - 1].price : lastTradePrice;
  const spreadBid = bidOrders.length > 0 ? bidOrders[0].price : lastTradePrice;
  const spreadValue = Math.round((spreadAsk - spreadBid) * 100) / 100;
  const spreadPercent = Math.round((spreadValue / lastTradePrice) * 10000) / 100;

  return (
    <div className="space-y-4">
      {/* CAT Selector */}
      <div className="relative">
        <button
          onClick={() => setSelectorOpen(!selectorOpen)}
          className="w-full md:w-auto flex items-center gap-3 glass-card rounded-2xl px-5 py-3.5 hover:border-miau-pink/30 transition-all"
        >
          <div className="w-11 h-11 rounded-xl shrink-0 overflow-hidden">
            <Image
              src={selectedCreator.thumbnail}
              alt={selectedCreator.name}
              width={44}
              height={44}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2">
              <span className="font-bold text-miau-white">
                {selectedCreator.catSymbol}
              </span>
              <span className="text-sm text-miau-muted">/MIAU</span>
              <span className={`text-xs px-2 py-0.5 rounded-lg font-bold ${tierBadge(selectedCreator.scoreTier)}`}>
                {selectedCreator.score}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-miau-white">
                {selectedCreator.currentPrice.toFixed(2)} MIAU
              </span>
              <span
                className={`text-xs font-semibold flex items-center gap-0.5 ${
                  selectedCreator.priceChange24h >= 0 ? 'text-miau-success' : 'text-miau-error'
                }`}
              >
                {selectedCreator.priceChange24h >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {selectedCreator.priceChange24h >= 0 ? '+' : ''}
                {selectedCreator.priceChange24h.toFixed(1)}%
              </span>
            </div>
          </div>

          <ChevronDown
            size={18}
            className={`ml-auto text-miau-muted transition-transform ${selectorOpen ? 'rotate-180' : ''}`}
          />
        </button>

        <AnimatePresence>
          {selectorOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 top-full left-0 mt-2 w-full md:w-[480px] bg-miau-dark-card border border-miau-dark-border rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-3 border-b border-miau-dark-border">
                <div className="flex items-center gap-2 bg-miau-dark-surface rounded-xl px-3 py-2.5">
                  <Search size={16} className="text-miau-muted" />
                  <input
                    type="text"
                    value={selectorSearch}
                    onChange={e => setSelectorSearch(e.target.value)}
                    placeholder="Search creators..."
                    className="bg-transparent text-sm text-miau-white placeholder-miau-muted outline-none w-full"
                    autoFocus
                  />
                  {selectorSearch && (
                    <button onClick={() => setSelectorSearch('')}>
                      <X size={14} className="text-miau-muted" />
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {filteredCreators.length === 0 ? (
                  <p className="p-4 text-sm text-miau-muted text-center">No creators found.</p>
                ) : (
                  filteredCreators.map(c => (
                    <button
                      key={c.id}
                      onClick={() => handleCreatorSelect(c.slug)}
                      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-miau-dark-hover transition-colors ${
                        c.slug === selectedCreatorSlug ? 'bg-miau-dark-surface' : ''
                      }`}
                    >
                      <div className="w-9 h-9 rounded-lg shrink-0 overflow-hidden">
                        <Image
                          src={c.thumbnail}
                          alt={c.name}
                          width={36}
                          height={36}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col items-start flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-miau-white">{c.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${tierBadge(c.scoreTier)}`}>
                            {c.score}
                          </span>
                        </div>
                        <span className="text-xs text-miau-muted">{c.catSymbol}/MIAU</span>
                      </div>
                      <div className="flex flex-col items-end shrink-0">
                        <span className="font-mono text-sm font-bold text-miau-white">
                          {c.currentPrice.toFixed(2)}
                        </span>
                        <span
                          className={`text-xs font-semibold ${
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

        {selectorOpen && (
          <div className="fixed inset-0 z-40" onClick={() => setSelectorOpen(false)} />
        )}
      </div>

      {/* Three-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT — Order Book */}
        <div className="lg:col-span-3">
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-miau-dark-border flex items-center justify-between">
              <h2 className="font-bold text-miau-white">Order Book</h2>
              <span className="text-xs text-miau-muted font-mono">
                {selectedCreator.catSymbol}/MIAU
              </span>
            </div>

            <div className="grid grid-cols-3 px-4 py-2 text-[11px] text-miau-muted font-semibold border-b border-miau-dark-border/50">
              <span>Price</span>
              <span className="text-right">Qty</span>
              <span className="text-right">Total</span>
            </div>

            {/* ASK side */}
            <div className="divide-y divide-transparent">
              {[...askOrders].reverse().map((order, idx) => (
                <button
                  key={`ask-${idx}`}
                  onClick={() => handleOrderBookPriceClick(order.price)}
                  className="relative w-full grid grid-cols-3 px-4 py-1.5 text-xs font-mono hover:bg-miau-error/5 transition-colors cursor-pointer"
                >
                  <div
                    className="absolute inset-y-0 right-0 bg-miau-error/10"
                    style={{ width: `${(order.quantity / maxAskQty) * 100}%` }}
                  />
                  <span className="relative text-miau-error font-semibold">{order.price.toFixed(1)}</span>
                  <span className="relative text-right text-miau-light">{order.quantity}</span>
                  <span className="relative text-right text-miau-muted">
                    {order.total.toLocaleString()}
                  </span>
                </button>
              ))}
            </div>

            {/* Spread */}
            <div className="px-4 py-2.5 bg-miau-dark-surface/60 border-y border-miau-dark-border/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowUpDown size={14} className="text-miau-muted" />
                <span className="font-mono font-bold text-base text-miau-white">
                  {lastTradePrice.toFixed(2)}
                </span>
                <span
                  className={`text-xs font-semibold ${
                    selectedCreator.priceChange24h >= 0 ? 'text-miau-success' : 'text-miau-error'
                  }`}
                >
                  {selectedCreator.priceChange24h >= 0 ? '+' : ''}
                  {selectedCreator.priceChange24h.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-miau-muted">
                <span>Spread</span>
                <span className="font-mono font-semibold">{spreadValue.toFixed(2)}</span>
                <span>({spreadPercent}%)</span>
              </div>
            </div>

            {/* BID side */}
            <div className="divide-y divide-transparent">
              {bidOrders.map((order, idx) => (
                <button
                  key={`bid-${idx}`}
                  onClick={() => handleOrderBookPriceClick(order.price)}
                  className="relative w-full grid grid-cols-3 px-4 py-1.5 text-xs font-mono hover:bg-miau-success/5 transition-colors cursor-pointer"
                >
                  <div
                    className="absolute inset-y-0 right-0 bg-miau-success/10"
                    style={{ width: `${(order.quantity / maxBidQty) * 100}%` }}
                  />
                  <span className="relative text-miau-success font-semibold">{order.price.toFixed(1)}</span>
                  <span className="relative text-right text-miau-light">{order.quantity}</span>
                  <span className="relative text-right text-miau-muted">
                    {order.total.toLocaleString()}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CENTRE — Chart + Trade */}
        <div className="lg:col-span-6 space-y-4">
          {/* Price Chart */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-miau-dark-border flex items-center justify-between flex-wrap gap-2">
              <h2 className="font-bold text-miau-white">
                {selectedCreator.catSymbol} Price
              </h2>
              <div className="flex items-center gap-1">
                {timeRanges.map(r => (
                  <button
                    key={r.label}
                    onClick={() => setActiveRange(r.label)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      activeRange === r.label
                        ? 'bg-miau-pink text-miau-white shadow-glow'
                        : 'text-miau-muted hover:bg-miau-dark-hover hover:text-miau-white'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-2 pt-4 pb-1">
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FF2D78" stopOpacity={0.3} />
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
                    minTickGap={40}
                  />
                  <YAxis
                    domain={['auto', 'auto']}
                    tick={{ fontSize: 10, fill: '#8888AA' }}
                    tickLine={false}
                    axisLine={false}
                    width={45}
                    tickFormatter={(v: number) => v.toFixed(0)}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#141428',
                      border: '1px solid #2A2A4A',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      color: '#FFFFFF',
                    }}
                    labelStyle={{ color: '#8888AA', fontSize: '11px' }}
                    formatter={(value: any) => [`${(value ?? 0).toFixed(2)} MIAU`, 'Price']}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#FF2D78"
                    strokeWidth={2}
                    fill="url(#priceGradient)"
                    dot={false}
                    activeDot={{ r: 4, fill: '#FF2D78', strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="px-2 pb-3">
              <ResponsiveContainer width="100%" height={60}>
                <BarChart data={chartData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                  <XAxis dataKey="time" hide />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      background: '#141428',
                      border: '1px solid #2A2A4A',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      color: '#FFFFFF',
                    }}
                    formatter={(value: any) => [value ?? 0, 'Volume']}
                    labelStyle={{ color: '#8888AA', fontSize: '11px' }}
                  />
                  <Bar dataKey="volume" fill="#FF2D78" opacity={0.3} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Trade Entry Panel */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-miau-dark-border">
              <h2 className="font-bold text-miau-white">Place Order</h2>
            </div>

            <div className="p-5 space-y-4">
              {/* BUY / SELL */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setTradeSide('buy')}
                  className={`py-3 rounded-xl font-bold text-sm transition-all ${
                    tradeSide === 'buy'
                      ? 'bg-miau-success text-black shadow-glow-green'
                      : 'bg-miau-dark-surface text-miau-muted hover:bg-miau-dark-hover hover:text-miau-white'
                  }`}
                >
                  BUY
                </button>
                <button
                  onClick={() => setTradeSide('sell')}
                  className={`py-3 rounded-xl font-bold text-sm transition-all ${
                    tradeSide === 'sell'
                      ? 'bg-miau-error text-miau-white'
                      : 'bg-miau-dark-surface text-miau-muted hover:bg-miau-dark-hover hover:text-miau-white'
                  }`}
                >
                  SELL
                </button>
              </div>

              {/* LIMIT / MARKET */}
              <div className="flex gap-2">
                <button
                  onClick={() => setOrderType('limit')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    orderType === 'limit'
                      ? 'bg-white text-miau-dark'
                      : 'bg-miau-dark-surface text-miau-muted hover:bg-miau-dark-hover hover:text-miau-white'
                  }`}
                >
                  LIMIT
                </button>
                <button
                  onClick={() => setOrderType('market')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    orderType === 'market'
                      ? 'bg-white text-miau-dark'
                      : 'bg-miau-dark-surface text-miau-muted hover:bg-miau-dark-hover hover:text-miau-white'
                  }`}
                >
                  MARKET
                </button>
              </div>

              {/* Price field */}
              {orderType === 'limit' && (
                <div>
                  <label className="block text-xs text-miau-muted mb-2 font-semibold">
                    Price (MIAU)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={tradePrice}
                    onChange={e => setTradePrice(e.target.value)}
                    className="w-full bg-miau-dark-surface border border-miau-dark-border rounded-xl px-4 py-3 font-mono text-sm text-miau-white focus:outline-none focus:border-miau-pink/50 focus:ring-1 focus:ring-miau-pink/30 transition-all"
                    placeholder="0.00"
                  />
                </div>
              )}

              {orderType === 'market' && (
                <div className="bg-miau-dark-surface rounded-xl px-4 py-3 flex items-center justify-between border border-miau-dark-border">
                  <span className="text-xs text-miau-muted font-semibold">Market Price</span>
                  <span className="font-mono text-sm font-bold text-miau-white">
                    {selectedCreator.currentPrice.toFixed(2)} MIAU
                  </span>
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className="block text-xs text-miau-muted mb-2 font-semibold">
                  Quantity ({selectedCreator.catSymbol})
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={tradeQuantity}
                  onChange={e => setTradeQuantity(e.target.value)}
                  className="w-full bg-miau-dark-surface border border-miau-dark-border rounded-xl px-4 py-3 font-mono text-sm text-miau-white focus:outline-none focus:border-miau-pink/50 focus:ring-1 focus:ring-miau-pink/30 transition-all"
                  placeholder="0"
                />
              </div>

              {/* Fee breakdown */}
              {parsedQuantity > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-miau-dark-surface/60 rounded-xl p-4 space-y-2 text-xs border border-miau-dark-border"
                >
                  <div className="flex justify-between">
                    <span className="text-miau-muted">Subtotal</span>
                    <span className="font-mono text-miau-white font-semibold">
                      {rawTotal.toFixed(2)} MIAU
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-miau-muted flex items-center gap-1">
                      Fee (0.25%)
                      {feeDiscount > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-miau-success">
                          <Shield size={10} />
                          {stakingTier} -{feeDiscount}%
                        </span>
                      )}
                    </span>
                    <span className="font-mono text-miau-white font-semibold">
                      {feeAmount.toFixed(2)} MIAU
                    </span>
                  </div>
                  <div className="border-t border-miau-dark-border pt-2 flex justify-between font-bold">
                    <span className="text-miau-white">
                      {tradeSide === 'buy' ? 'Total Cost' : 'You Receive'}
                    </span>
                    <span className="font-mono text-miau-white">{totalWithFee.toFixed(2)} MIAU</span>
                  </div>
                </motion.div>
              )}

              {/* Balance */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-miau-muted font-semibold">Available</span>
                <span className="font-mono font-bold text-miau-white">
                  {miauBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MIAU
                </span>
              </div>

              {lowBalanceWarning && (
                <div className="flex items-start gap-2 bg-miau-warning/10 border border-miau-warning/30 rounded-xl px-4 py-3">
                  <AlertTriangle size={16} className="text-miau-warning shrink-0 mt-0.5" />
                  <p className="text-xs text-miau-warning font-semibold leading-relaxed">
                    Low balance — below 1,000 MIAU will disable trading access.
                  </p>
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmitOrder}
                disabled={isSubmitting || parsedQuantity <= 0 || (orderType === 'limit' && parsedPrice <= 0)}
                className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed ${
                  tradeSide === 'buy'
                    ? 'bg-miau-success hover:bg-miau-success/90 text-black shadow-glow-green'
                    : 'bg-miau-error hover:bg-miau-error/90 text-miau-white'
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

        {/* RIGHT — Recent Trades + Open Orders */}
        <div className="lg:col-span-3 space-y-4">
          {/* Recent Trades */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-miau-dark-border">
              <h2 className="font-bold text-miau-white">Recent Trades</h2>
            </div>

            <div className="grid grid-cols-4 px-4 py-2 text-[11px] text-miau-muted font-semibold border-b border-miau-dark-border/50">
              <span>Time</span>
              <span className="text-right">Price</span>
              <span className="text-right">Qty</span>
              <span className="text-right">Side</span>
            </div>

            <div className="divide-y divide-miau-dark-border/30">
              {recentTrades.slice(0, 15).map(trade => (
                <div
                  key={trade.id}
                  className="grid grid-cols-4 px-4 py-1.5 text-xs font-mono hover:bg-miau-dark-hover/40 transition-colors"
                >
                  <span className="text-miau-muted">{trade.time}</span>
                  <span
                    className={`text-right font-semibold ${
                      trade.side === 'buy' ? 'text-miau-success' : 'text-miau-error'
                    }`}
                  >
                    {trade.price.toFixed(1)}
                  </span>
                  <span className="text-right text-miau-light">{trade.quantity}</span>
                  <span className="text-right">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        trade.side === 'buy'
                          ? 'bg-miau-success/15 text-miau-success'
                          : 'bg-miau-error/15 text-miau-error'
                      }`}
                    >
                      {trade.side}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Open Orders */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-miau-dark-border flex items-center justify-between">
              <h2 className="font-bold text-miau-white">My Orders</h2>
              <span className="text-xs text-miau-muted font-mono">{openOrders.length} active</span>
            </div>

            {openOrders.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-miau-muted">No open orders.</p>
                <p className="text-xs text-miau-muted/60 mt-1">Place an order to get started.</p>
              </div>
            ) : (
              <div className="divide-y divide-miau-dark-border/30">
                {openOrders.map(order => (
                  <div key={order.id} className="px-4 py-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                            order.side === 'Buy'
                              ? 'bg-miau-success/15 text-miau-success'
                              : 'bg-miau-error/15 text-miau-error'
                          }`}
                        >
                          {order.side}
                        </span>
                        <span className="text-xs font-semibold text-miau-white">{order.pair}</span>
                        <span className="text-[10px] text-miau-muted bg-miau-dark-surface px-1.5 py-0.5 rounded">
                          {order.type}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          order.status === 'Pending'
                            ? 'bg-miau-warning/15 text-miau-warning'
                            : order.status === 'Partial'
                              ? 'bg-blue-500/15 text-blue-400'
                              : 'bg-miau-success/15 text-miau-success'
                        }`}
                      >
                        {order.status === 'Pending' && <Clock size={10} />}
                        {order.status === 'Partial' && <Loader2 size={10} />}
                        {order.status === 'Filled' && <CheckCircle2 size={10} />}
                        {order.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-miau-muted block text-[10px]">Price</span>
                        <span className="font-mono font-semibold text-miau-white">
                          {order.price.toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-miau-muted block text-[10px]">Qty</span>
                        <span className="font-mono font-semibold text-miau-white">{order.quantity}</span>
                      </div>
                      <div>
                        <span className="text-miau-muted block text-[10px]">Filled</span>
                        <span className="font-mono font-semibold text-miau-white">
                          {order.filled}/{order.quantity}
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-miau-dark-border/40 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          order.status === 'Filled'
                            ? 'bg-miau-success'
                            : order.status === 'Partial'
                              ? 'bg-blue-400'
                              : 'bg-miau-dark-border'
                        }`}
                        style={{ width: `${(order.filled / order.quantity) * 100}%` }}
                      />
                    </div>

                    {order.status !== 'Filled' && (
                      <>
                        {cancelConfirmId === order.id ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-miau-error font-semibold">Cancel?</span>
                            <button
                              onClick={() => handleCancelOrder(order.id)}
                              className="text-xs bg-miau-error text-miau-white px-3 py-1 rounded-lg font-bold hover:bg-miau-error/90 transition-colors"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setCancelConfirmId(null)}
                              className="text-xs bg-miau-dark-surface text-miau-muted px-3 py-1 rounded-lg font-semibold hover:bg-miau-dark-hover transition-colors"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setCancelConfirmId(order.id)}
                            className="flex items-center gap-1 text-xs text-miau-error/70 hover:text-miau-error font-semibold transition-colors"
                          >
                            <XCircle size={12} />
                            Cancel
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
