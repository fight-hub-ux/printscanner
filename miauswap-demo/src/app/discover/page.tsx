'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, TrendingUp, Star, ArrowUpRight, ArrowDownRight, Filter, Sparkles } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { creators, marketStats, generatePriceData } from '@/lib/dummyData';
import { useApp } from '@/context/AppContext';

type FilterPill = 'All' | 'Top Yield' | 'Trending' | 'New Listings' | 'Platinum Rated';
type SortOption = 'Highest Yield' | 'Lowest Price' | 'Most Active' | 'Newest' | 'Highest Score';

const filterPills: FilterPill[] = ['All', 'Top Yield', 'Trending', 'New Listings', 'Platinum Rated'];
const sortOptions: SortOption[] = ['Highest Yield', 'Lowest Price', 'Most Active', 'Newest', 'Highest Score'];

const sparklineDataMap: Record<string, { time: string; price: number; volume: number }[]> = {};
creators.forEach((creator) => {
  sparklineDataMap[creator.id] = generatePriceData(creator.currentPrice, 7);
});

function parseMemberSince(memberSince: string): Date {
  const parts = memberSince.split(' ');
  const monthStr = parts[0];
  const yearStr = parts[1];
  const monthMap: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  };
  return new Date(parseInt(yearStr), monthMap[monthStr] || 0, 1);
}

function getScoreBadgeClasses(scoreTier: 'Platinum' | 'Gold' | 'Silver'): string {
  switch (scoreTier) {
    case 'Platinum':
      return 'bg-gradient-to-r from-violet-500 to-purple-600 text-miau-white';
    case 'Gold':
      return 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black';
    case 'Silver':
      return 'bg-gradient-to-r from-gray-400 to-gray-500 text-miau-white';
  }
}

export default function DiscoverPage() {
  const { setSelectedCreatorSlug } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterPill>('All');
  const [sortBy, setSortBy] = useState<SortOption>('Highest Yield');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const filteredAndSortedCreators = useMemo(() => {
    let result = [...creators];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.catSymbol.toLowerCase().includes(query)
      );
    }

    switch (activeFilter) {
      case 'Top Yield':
        result = result.sort((a, b) => b.annualYield - a.annualYield);
        break;
      case 'Trending':
        result = result.filter((c) => c.priceChange24h > 2);
        break;
      case 'New Listings': {
        const cutoff = new Date(2025, 9, 1);
        result = result.filter((c) => parseMemberSince(c.memberSince) >= cutoff);
        break;
      }
      case 'Platinum Rated':
        result = result.filter((c) => c.scoreTier === 'Platinum');
        break;
      case 'All':
      default:
        break;
    }

    switch (sortBy) {
      case 'Highest Yield':
        result.sort((a, b) => b.annualYield - a.annualYield);
        break;
      case 'Lowest Price':
        result.sort((a, b) => a.currentPrice - b.currentPrice);
        break;
      case 'Most Active':
        result.sort((a, b) => b.subscribers - a.subscribers);
        break;
      case 'Newest':
        result.sort(
          (a, b) =>
            parseMemberSince(b.memberSince).getTime() -
            parseMemberSince(a.memberSince).getTime()
        );
        break;
      case 'Highest Score':
        result.sort((a, b) => b.score - a.score);
        break;
    }

    return result;
  }, [searchQuery, activeFilter, sortBy]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 lg:pb-6">
      {/* Hero Section */}
      <div className="space-y-6">
        <div className="text-center space-y-3 pt-2">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-miau-white tracking-tight">
            Invest in Your Favourite Creators
          </h1>
          <p className="text-base text-miau-muted max-w-xl mx-auto leading-relaxed">
            Buy Creator Tokens, earn weekly ETH income. Simple as that.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto">
          <Search
            size={20}
            className="absolute left-5 top-1/2 -translate-y-1/2 text-miau-muted"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search creators..."
            className="w-full pl-14 pr-5 py-4 bg-miau-dark-card border border-miau-dark-border rounded-2xl text-base text-miau-white placeholder:text-miau-muted focus:outline-none focus:ring-2 focus:ring-miau-pink/40 focus:border-miau-pink/50 transition-all"
          />
        </div>

        {/* Filter Pills + Sort */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {filterPills.map((pill) => (
              <button
                key={pill}
                onClick={() => setActiveFilter(pill)}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeFilter === pill
                    ? 'bg-miau-pink text-miau-white shadow-glow'
                    : 'bg-miau-dark-card border border-miau-dark-border text-miau-muted hover:bg-miau-dark-hover hover:text-miau-white'
                }`}
              >
                {pill}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center gap-2 px-5 py-2 bg-miau-dark-card border border-miau-dark-border rounded-xl text-sm font-semibold text-miau-muted hover:bg-miau-dark-hover hover:text-miau-white transition-colors"
            >
              <Filter size={14} />
              <span>Sort: {sortBy}</span>
            </button>
            {showSortDropdown && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-miau-dark-card border border-miau-dark-border rounded-xl shadow-2xl z-20 overflow-hidden">
                {sortOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setSortBy(option);
                      setShowSortDropdown(false);
                    }}
                    className={`w-full text-left px-5 py-3 text-sm font-medium transition-colors ${
                      sortBy === option
                        ? 'bg-miau-pink/15 text-miau-pink'
                        : 'text-miau-muted hover:bg-miau-dark-hover hover:text-miau-white'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Market Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: 'Creators Listed', value: marketStats.totalCATsListed.toString() },
          { label: '24h Volume', value: `${marketStats.volume24h.toLocaleString()}`, suffix: 'MIAU' },
          { label: 'Market Cap', value: `${(marketStats.totalMarketCap / 1000000).toFixed(1)}M`, suffix: 'MIAU' },
          { label: 'Active Investors', value: marketStats.activeInvestors.toLocaleString() },
          { label: 'Paid This Week', value: marketStats.weeklyDistributionsPaid.toLocaleString(), suffix: 'MIAU' },
        ].map((stat, i) => (
          <div key={i} className="glass-card rounded-2xl p-5 text-center">
            <p className="text-xs text-miau-muted mb-2 font-medium uppercase tracking-wide">{stat.label}</p>
            <p className="text-2xl font-bold text-miau-white">
              {stat.value}
              {stat.suffix && <span className="text-sm font-normal text-miau-muted ml-1">{stat.suffix}</span>}
            </p>
          </div>
        ))}
      </div>

      {/* Creator CAT Cards Grid */}
      {filteredAndSortedCreators.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-miau-muted text-base">
            No creators match your search.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveFilter('All');
            }}
            className="mt-4 text-sm text-miau-pink hover:text-miau-pink-soft font-semibold transition-colors"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredAndSortedCreators.map((creator, index) => {
            const sparklineData = sparklineDataMap[creator.id];
            const isPositive = creator.priceChange24h >= 0;
            const isVerified =
              creator.scoreTier === 'Platinum' || creator.scoreTier === 'Gold';

            return (
              <motion.div
                key={creator.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                className="glass-card rounded-3xl overflow-hidden hover:shadow-card-hover transition-all duration-300 group"
              >
                <div className="p-6 space-y-5">
                  {/* Top: Avatar + Name + Score Badge */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      {/* Avatar — bigger, bolder */}
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-miau-white font-bold text-lg shrink-0 shadow-lg"
                        style={{
                          background: `linear-gradient(135deg, ${creator.gradientFrom}, ${creator.gradientTo})`,
                        }}
                      >
                        {creator.initials}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-miau-white truncate">
                            {creator.name}
                          </h3>
                          {isVerified && (
                            <Star
                              size={16}
                              className="text-yellow-400 fill-yellow-400 shrink-0"
                            />
                          )}
                        </div>
                        <p className="text-sm text-miau-muted font-mono">
                          ${creator.catSymbol}
                        </p>
                      </div>
                    </div>

                    {/* Score Badge */}
                    <span
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl shrink-0 ${getScoreBadgeClasses(
                        creator.scoreTier
                      )}`}
                    >
                      {creator.scoreTier} {creator.score}
                    </span>
                  </div>

                  {/* Price + 24h Change */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-miau-muted mb-1">Price</p>
                      <p className="text-2xl font-bold text-miau-white">
                        {creator.currentPrice.toLocaleString()}{' '}
                        <span className="text-sm font-normal text-miau-muted">
                          MIAU
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-miau-muted mb-1">24h</p>
                      <div
                        className={`flex items-center justify-end gap-1 text-lg font-bold ${
                          isPositive ? 'text-miau-success' : 'text-miau-error'
                        }`}
                      >
                        {isPositive ? (
                          <ArrowUpRight size={18} />
                        ) : (
                          <ArrowDownRight size={18} />
                        )}
                        <span>
                          {isPositive ? '+' : ''}
                          {creator.priceChange24h.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Weekly Yield — the key selling point, make it POP */}
                  <div className="bg-miau-success/10 border border-miau-success/20 rounded-2xl px-4 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-miau-success/80 font-semibold uppercase tracking-wide flex items-center gap-1.5">
                        <Sparkles size={12} />
                        Weekly Earnings
                      </p>
                      <p className="text-lg font-bold text-miau-success mt-0.5">
                        {creator.weeklyDistributionETH.toFixed(4)} ETH
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-miau-success/80 font-semibold uppercase tracking-wide">
                        Annual Yield
                      </p>
                      <p className="text-lg font-bold text-miau-success flex items-center gap-1 justify-end mt-0.5">
                        <TrendingUp size={16} />
                        {creator.annualYield.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* Edition Availability */}
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <span
                      className={`px-3 py-1 rounded-lg ${
                        creator.foundersRemaining === 0
                          ? 'bg-miau-dark-surface text-miau-muted line-through'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      Founders:{' '}
                      {creator.foundersRemaining === 0
                        ? 'SOLD'
                        : `${creator.foundersRemaining} left`}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-lg ${
                        creator.limitedRemaining === 0
                          ? 'bg-miau-dark-surface text-miau-muted line-through'
                          : 'bg-miau-pink/15 text-miau-pink border border-miau-pink/20'
                      }`}
                    >
                      Limited: {creator.limitedRemaining} left
                    </span>
                    <span className="px-3 py-1 rounded-lg bg-miau-dark-surface text-miau-light border border-miau-dark-border">
                      Open: {creator.standardRemaining}
                    </span>
                  </div>

                  {/* Mini Sparkline Chart */}
                  <div className="h-16 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={sparklineData}>
                        <Line
                          type="monotone"
                          dataKey="price"
                          stroke={isPositive ? '#00F5A0' : '#FF4466'}
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Action Buttons — bigger, bolder */}
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/creator/${creator.slug}`}
                      className="flex-1 text-center px-5 py-3 bg-miau-dark-surface border border-miau-dark-border rounded-xl text-sm font-bold text-miau-light hover:bg-miau-dark-hover hover:text-miau-white transition-all"
                    >
                      View Profile
                    </Link>
                    <Link
                      href="/trade"
                      onClick={() => setSelectedCreatorSlug(creator.slug)}
                      className="flex-1 text-center px-5 py-3 bg-miau-pink text-miau-white rounded-xl text-sm font-bold hover:bg-miau-pink-soft transition-all shadow-glow"
                    >
                      Invest Now
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Close sort dropdown when clicking outside */}
      {showSortDropdown && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowSortDropdown(false)}
        />
      )}
    </div>
  );
}
