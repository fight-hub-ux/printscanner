'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, TrendingUp, Star, ArrowUpRight, ArrowDownRight, Filter } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { creators, marketStats, generatePriceData } from '@/lib/dummyData';
import { useApp } from '@/context/AppContext';

type FilterPill = 'All' | 'Top Yield' | 'Trending' | 'New Listings' | 'Platinum Rated';
type SortOption = 'Highest Yield' | 'Lowest Price' | 'Most Active' | 'Newest' | 'Highest Score';

const filterPills: FilterPill[] = ['All', 'Top Yield', 'Trending', 'New Listings', 'Platinum Rated'];
const sortOptions: SortOption[] = ['Highest Yield', 'Lowest Price', 'Most Active', 'Newest', 'Highest Score'];

// Pre-generate sparkline data for each creator so it stays stable across renders
const sparklineDataMap: Record<string, { time: string; price: number; volume: number }[]> = {};
creators.forEach((creator) => {
  sparklineDataMap[creator.id] = generatePriceData(creator.currentPrice, 7);
});

// Helper to parse memberSince into a comparable date
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
      return 'bg-yellow-100 text-yellow-800';
    case 'Gold':
      return 'bg-amber-100 text-amber-800';
    case 'Silver':
      return 'bg-slate-100 text-slate-600';
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

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.catSymbol.toLowerCase().includes(query)
      );
    }

    // Filter pills
    switch (activeFilter) {
      case 'Top Yield':
        result = result.sort((a, b) => b.annualYield - a.annualYield);
        break;
      case 'Trending':
        result = result.filter((c) => c.priceChange24h > 2);
        break;
      case 'New Listings': {
        const cutoff = new Date(2025, 9, 1); // Oct 2025
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

    // Sort
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
    <div className="max-w-7xl mx-auto space-y-6 pb-20 lg:pb-6">
      {/* Hero Section */}
      <div className="space-y-5">
        <div className="text-center space-y-2">
          <h1 className="text-2xl lg:text-3xl font-serif font-bold text-miau-brown">
            Discover Creator CATs
          </h1>
          <p className="text-sm text-miau-rose-brown max-w-xl mx-auto">
            Browse, compare, and invest in Creator Access Tokens. Earn weekly ETH distributions from your favourite creators.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto">
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-miau-rose-brown"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search creator name, category, yield..."
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-miau-taupe rounded-2xl text-sm text-miau-brown placeholder:text-miau-grey focus:outline-none focus:ring-2 focus:ring-miau-pink/40 focus:border-miau-pink transition-all"
          />
        </div>

        {/* Filter Pills + Sort */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {filterPills.map((pill) => (
              <button
                key={pill}
                onClick={() => setActiveFilter(pill)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeFilter === pill
                    ? 'bg-miau-dark text-white shadow-sm'
                    : 'bg-white border border-miau-taupe text-miau-rose-brown hover:bg-miau-pale hover:text-miau-brown'
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
              className="flex items-center gap-2 px-4 py-1.5 bg-white border border-miau-taupe rounded-full text-xs font-medium text-miau-rose-brown hover:bg-miau-pale transition-colors"
            >
              <Filter size={14} />
              <span>Sort: {sortBy}</span>
            </button>
            {showSortDropdown && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-miau-taupe rounded-xl shadow-lg z-20 overflow-hidden">
                {sortOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setSortBy(option);
                      setShowSortDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors ${
                      sortBy === option
                        ? 'bg-miau-pink/20 text-miau-brown'
                        : 'text-miau-rose-brown hover:bg-miau-pale'
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
        <div className="bg-white border border-miau-taupe rounded-2xl p-4 text-center">
          <p className="text-xs text-miau-rose-brown mb-1">Total CATs Listed</p>
          <p className="text-xl font-bold text-miau-brown">{marketStats.totalCATsListed}</p>
        </div>
        <div className="bg-white border border-miau-taupe rounded-2xl p-4 text-center">
          <p className="text-xs text-miau-rose-brown mb-1">24h Volume</p>
          <p className="text-xl font-bold text-miau-brown">
            {marketStats.volume24h.toLocaleString()}
            <span className="text-xs font-normal text-miau-rose-brown ml-1">MIAU</span>
          </p>
        </div>
        <div className="bg-white border border-miau-taupe rounded-2xl p-4 text-center">
          <p className="text-xs text-miau-rose-brown mb-1">Total Market Cap</p>
          <p className="text-xl font-bold text-miau-brown">
            {(marketStats.totalMarketCap / 1000000).toFixed(1)}M
            <span className="text-xs font-normal text-miau-rose-brown ml-1">MIAU</span>
          </p>
        </div>
        <div className="bg-white border border-miau-taupe rounded-2xl p-4 text-center">
          <p className="text-xs text-miau-rose-brown mb-1">Active Investors</p>
          <p className="text-xl font-bold text-miau-brown">
            {marketStats.activeInvestors.toLocaleString()}
          </p>
        </div>
        <div className="col-span-2 sm:col-span-1 bg-white border border-miau-taupe rounded-2xl p-4 text-center">
          <p className="text-xs text-miau-rose-brown mb-1">Weekly Distributions Paid</p>
          <p className="text-xl font-bold text-miau-brown">
            {marketStats.weeklyDistributionsPaid.toLocaleString()}
            <span className="text-xs font-normal text-miau-rose-brown ml-1">MIAU equiv. in ETH</span>
          </p>
        </div>
      </div>

      {/* Creator CAT Cards Grid */}
      {filteredAndSortedCreators.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-miau-rose-brown text-sm">
            No creators match your search or filter criteria.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveFilter('All');
            }}
            className="mt-3 text-xs text-miau-dark hover:underline font-medium"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
                transition={{ duration: 0.35, delay: index * 0.06 }}
                className="bg-miau-blush border border-miau-taupe rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-5 space-y-4">
                  {/* Top: Avatar + Name + Score Badge */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${creator.gradientFrom}, ${creator.gradientTo})`,
                        }}
                      >
                        {creator.initials}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-semibold text-sm text-miau-brown truncate">
                            {creator.name}
                          </h3>
                          {isVerified && (
                            <Star
                              size={14}
                              className="text-yellow-500 fill-yellow-500 shrink-0"
                            />
                          )}
                        </div>
                        <p className="text-xs text-miau-rose-brown font-mono">
                          ${creator.catSymbol}
                        </p>
                      </div>
                    </div>

                    {/* Score Badge */}
                    <span
                      className={`text-[10px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${getScoreBadgeClasses(
                        creator.scoreTier
                      )}`}
                    >
                      {creator.scoreTier} ({creator.score})
                    </span>
                  </div>

                  {/* Price + 24h Change */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-miau-rose-brown">Current Price</p>
                      <p className="text-lg font-bold text-miau-brown">
                        {creator.currentPrice.toLocaleString()}{' '}
                        <span className="text-xs font-normal text-miau-rose-brown">
                          MIAU
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-miau-rose-brown">24h Change</p>
                      <div
                        className={`flex items-center justify-end gap-1 text-sm font-semibold ${
                          isPositive ? 'text-miau-success' : 'text-miau-error'
                        }`}
                      >
                        {isPositive ? (
                          <ArrowUpRight size={14} />
                        ) : (
                          <ArrowDownRight size={14} />
                        )}
                        <span>
                          {isPositive ? '+' : ''}
                          {creator.priceChange24h.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Weekly Distribution Yield */}
                  <div className="bg-white/60 rounded-xl px-3 py-2.5 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-miau-rose-brown uppercase tracking-wide">
                        Weekly Yield / CAT
                      </p>
                      <p className="text-sm font-semibold text-miau-brown">
                        {creator.weeklyDistributionETH.toFixed(4)} ETH
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-miau-rose-brown uppercase tracking-wide">
                        Annual Yield
                      </p>
                      <p className="text-sm font-semibold text-miau-success flex items-center gap-1 justify-end">
                        <TrendingUp size={13} />
                        {creator.annualYield.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* Edition Availability */}
                  <div className="flex items-center gap-2 text-[10px] font-medium">
                    <span
                      className={`px-2 py-0.5 rounded-md ${
                        creator.foundersRemaining === 0
                          ? 'bg-miau-grey/20 text-miau-grey line-through'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      Founders:{' '}
                      {creator.foundersRemaining === 0
                        ? 'SOLD'
                        : `${creator.foundersRemaining} left`}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md ${
                        creator.limitedRemaining === 0
                          ? 'bg-miau-grey/20 text-miau-grey line-through'
                          : 'bg-miau-pink/20 text-miau-dark'
                      }`}
                    >
                      Limited: {creator.limitedRemaining} left
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-miau-pale text-miau-brown">
                      Standard: {creator.standardRemaining} left
                    </span>
                  </div>

                  {/* Mini Sparkline Chart */}
                  <div className="h-16 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={sparklineData}>
                        <Line
                          type="monotone"
                          dataKey="price"
                          stroke={isPositive ? '#22C55E' : '#EF4444'}
                          strokeWidth={1.5}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/creator/${creator.slug}`}
                      className="flex-1 text-center px-4 py-2.5 bg-white border border-miau-taupe rounded-xl text-xs font-semibold text-miau-brown hover:bg-miau-pale transition-colors"
                    >
                      View Profile
                    </Link>
                    <Link
                      href="/trade"
                      onClick={() => setSelectedCreatorSlug(creator.slug)}
                      className="flex-1 text-center px-4 py-2.5 bg-miau-dark text-white rounded-xl text-xs font-semibold hover:bg-miau-brown transition-colors"
                    >
                      Trade Now
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
