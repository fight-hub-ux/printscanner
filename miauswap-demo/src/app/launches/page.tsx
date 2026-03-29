'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import {
  Rocket,
  Clock,
  Users,
  TrendingUp,
  Sparkles,
  CalendarDays,
  ArrowRight,
  CheckCircle2,
  Timer,
  Bell,
  BellOff,
  Star,
  Crown,
  Shield,
  X,
  ChevronLeft,
  ChevronRight,
  Target,
  Megaphone,
  Handshake,
  Send,
} from 'lucide-react';
import { catLaunches, type CATLaunch } from '@/lib/dummyData';
import { useApp } from '@/context/AppContext';

// ---------- helpers ----------

function getScoreBadgeClasses(tier: CATLaunch['scoreTier']): string {
  switch (tier) {
    case 'Platinum':
      return 'bg-gradient-to-r from-violet-500 to-purple-600 text-white';
    case 'Gold':
      return 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black';
    case 'Silver':
      return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
  }
}

function getTierBadge(tier: CATLaunch['listingTier']) {
  switch (tier) {
    case 'Managed':
      return { label: 'Managed Offering', icon: Crown, classes: 'bg-amber-500/15 text-amber-400 border-amber-500/25' };
    case 'Featured':
      return { label: 'Featured Launch', icon: Star, classes: 'bg-violet-500/15 text-violet-400 border-violet-500/25' };
    case 'Standard':
      return { label: 'Standard Listing', icon: Shield, classes: 'bg-miau-dark-surface text-miau-light border-miau-dark-border' };
  }
}

function useCountdown(targetDate: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, new Date(targetDate).getTime() - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { d, h, m, s, expired: diff <= 0 };
}

function CountdownDisplay({ targetDate }: { targetDate: string }) {
  const { d, h, m, s, expired } = useCountdown(targetDate);
  if (expired) return <span className="text-miau-success font-bold">LIVE NOW</span>;
  return (
    <div className="flex items-center gap-1 font-mono text-lg font-bold tabular-nums">
      {[
        { v: d, l: 'd' },
        { v: h, l: 'h' },
        { v: m, l: 'm' },
        { v: s, l: 's' },
      ].map(({ v, l }) => (
        <span key={l} className="flex items-baseline gap-0.5">
          <span className="bg-miau-dark-surface/60 px-2 py-1 rounded-lg text-miau-white">{String(v).padStart(2, '0')}</span>
          <span className="text-xs text-miau-muted">{l}</span>
        </span>
      ))}
    </div>
  );
}

// ---------- Tab types ----------
type LaunchTab = 'upcoming' | 'open' | 'closed';
const tabLabels: Record<LaunchTab, string> = { upcoming: 'Upcoming', open: 'Open Now', closed: 'Recently Closed' };

// hero candidates: Featured or Managed only
const heroCandidates = catLaunches.filter(l => l.listingTier !== 'Standard' && l.tab !== 'closed');

export default function LaunchesPage() {
  const { showToast, setSelectedCreatorSlug } = useApp();

  // hero carousel
  const [heroIdx, setHeroIdx] = useState(0);
  useEffect(() => {
    if (heroCandidates.length <= 1) return;
    const id = setInterval(() => setHeroIdx(prev => (prev + 1) % heroCandidates.length), 8000);
    return () => clearInterval(id);
  }, []);
  const heroLaunch = heroCandidates[heroIdx] || catLaunches[0];

  // grid
  const [activeTab, setActiveTab] = useState<LaunchTab>('upcoming');
  const gridLaunches = useMemo(() => catLaunches.filter(l => l.tab === activeTab), [activeTab]);

  // notify-me toggles
  const [notified, setNotified] = useState<Record<string, boolean>>({});
  const toggleNotify = useCallback((id: string, name: string) => {
    setNotified(prev => {
      const next = !prev[id];
      showToast(next ? `You'll be notified when ${name} goes live` : `Notification removed for ${name}`);
      return { ...prev, [id]: next };
    });
  }, [showToast]);

  // detail modal
  const [detailLaunch, setDetailLaunch] = useState<CATLaunch | null>(null);

  // managed offering apply modal
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applySubmitted, setApplySubmitted] = useState(false);

  // open-now progress bar animation
  const [progressAnimated, setProgressAnimated] = useState(false);
  useEffect(() => {
    if (activeTab === 'open') {
      const t = setTimeout(() => setProgressAnimated(true), 300);
      return () => clearTimeout(t);
    }
    setProgressAnimated(false);
  }, [activeTab]);

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 lg:pb-6">

      {/* ═══════ HERO CAROUSEL ═══════ */}
      <div className="relative glass-card rounded-3xl overflow-hidden">
        {/* Gradient overlay */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ background: `linear-gradient(135deg, ${heroLaunch.gradientFrom}, ${heroLaunch.gradientTo})` }}
        />
        <div className="relative p-6 md:p-10 space-y-6">
          {/* Nav arrows */}
          {heroCandidates.length > 1 && (
            <div className="absolute top-1/2 -translate-y-1/2 left-2 md:left-4 z-10">
              <button onClick={() => setHeroIdx((heroIdx - 1 + heroCandidates.length) % heroCandidates.length)} className="p-2 rounded-full bg-miau-dark-card/60 hover:bg-miau-dark-card text-miau-muted hover:text-miau-white transition-colors"><ChevronLeft size={20} /></button>
            </div>
          )}
          {heroCandidates.length > 1 && (
            <div className="absolute top-1/2 -translate-y-1/2 right-2 md:right-4 z-10">
              <button onClick={() => setHeroIdx((heroIdx + 1) % heroCandidates.length)} className="p-2 rounded-full bg-miau-dark-card/60 hover:bg-miau-dark-card text-miau-muted hover:text-miau-white transition-colors"><ChevronRight size={20} /></button>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div key={heroLaunch.id} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.35 }}>
              {/* tier badge */}
              <div className="flex items-center gap-3 flex-wrap">
                {(() => {
                  const tb = getTierBadge(heroLaunch.listingTier);
                  const Icon = tb.icon;
                  return <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border ${tb.classes}`}><Icon size={14} />{tb.label}</span>;
                })()}
                <span className={`text-xs font-bold px-3 py-1.5 rounded-xl ${getScoreBadgeClasses(heroLaunch.scoreTier)}`}>{heroLaunch.scoreTier} {heroLaunch.score}</span>
                {heroLaunch.vipEarlyAccess && (
                  <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-miau-pink/15 text-miau-pink border border-miau-pink/25">VIP 24hr Early Access</span>
                )}
              </div>

              {/* name + avatar */}
              <div className="flex items-center gap-5 mt-4">
                <div
                  className="w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center text-white font-bold text-2xl md:text-3xl shrink-0 shadow-lg border border-white/20"
                  style={{ background: `linear-gradient(135deg, ${heroLaunch.gradientFrom}, ${heroLaunch.gradientTo})` }}
                >
                  {heroLaunch.initials}
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-miau-white">{heroLaunch.name}</h2>
                  <p className="text-sm text-miau-muted font-mono">${heroLaunch.catSymbol}</p>
                  <p className="text-sm text-miau-light mt-1">{heroLaunch.tagline}</p>
                </div>
              </div>

              {/* countdown */}
              <div className="mt-5">
                <p className="text-xs text-miau-muted font-semibold uppercase tracking-wide mb-2">Launches In</p>
                <CountdownDisplay targetDate={heroLaunch.launchDate} />
              </div>

              {/* teaser stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                <div>
                  <p className="text-xs text-miau-muted mb-1">Est. Monthly Revenue</p>
                  <p className="text-lg font-bold text-miau-white">${heroLaunch.monthlyRevenue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-miau-muted mb-1">Edition Structure</p>
                  <p className="text-sm font-semibold text-miau-light">{heroLaunch.foundersTotal} F · {heroLaunch.limitedTotal} L · {heroLaunch.standardTotal} S</p>
                </div>
                <div>
                  <p className="text-xs text-miau-muted mb-1">Est. Yield</p>
                  <p className="text-lg font-bold text-miau-success">{heroLaunch.estimatedYieldLow}–{heroLaunch.estimatedYieldHigh}%</p>
                </div>
                <div>
                  <p className="text-xs text-miau-muted mb-1">Revenue Share</p>
                  <p className="text-lg font-bold text-miau-white">{heroLaunch.revenueSharePercent}%</p>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="flex items-center gap-3 mt-6 flex-wrap">
                <button
                  onClick={() => toggleNotify(heroLaunch.id, heroLaunch.name)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all ${
                    notified[heroLaunch.id]
                      ? 'bg-miau-success/15 text-miau-success border border-miau-success/25'
                      : 'bg-miau-pink text-white hover:bg-miau-pink-soft shadow-glow'
                  }`}
                >
                  {notified[heroLaunch.id] ? <><CheckCircle2 size={16} />Notified</> : <><Bell size={16} />Notify Me</>}
                </button>
                <button
                  onClick={() => setDetailLaunch(heroLaunch)}
                  className="flex items-center gap-2 px-5 py-3 bg-miau-dark-surface border border-miau-dark-border rounded-xl text-sm font-bold text-miau-light hover:bg-miau-dark-hover hover:text-miau-white transition-all"
                >
                  View Details <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* carousel dots */}
          {heroCandidates.length > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              {heroCandidates.map((_, i) => (
                <button key={i} onClick={() => setHeroIdx(i)} className={`w-2.5 h-2.5 rounded-full transition-all ${i === heroIdx ? 'bg-miau-pink scale-125' : 'bg-miau-dark-border hover:bg-miau-muted'}`} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ═══════ TAB FILTER ═══════ */}
      <div className="flex items-center gap-2">
        {(['upcoming', 'open', 'closed'] as LaunchTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab
                ? 'bg-miau-pink text-miau-white shadow-glow'
                : 'bg-miau-dark-card border border-miau-dark-border text-miau-muted hover:bg-miau-dark-hover hover:text-miau-white'
            }`}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </div>

      {/* ═══════ LAUNCH GRID ═══════ */}
      {gridLaunches.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-miau-muted text-base">No launches in this category yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {gridLaunches.map((launch, index) => {
            const tb = getTierBadge(launch.listingTier);
            const TierIcon = tb.icon;
            const soldPercent = launch.totalCATs > 0 ? Math.round((launch.catsSold / launch.totalCATs) * 100) : 0;
            const isClosed = launch.tab === 'closed';
            const isOpen = launch.tab === 'open';

            return (
              <motion.div
                key={launch.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className={`glass-card rounded-3xl overflow-hidden hover:shadow-card-hover transition-all duration-300 ${launch.listingTier === 'Managed' ? 'ring-1 ring-amber-500/30' : ''}`}
              >
                <div className="p-6 space-y-4">
                  {/* Header: avatar + name + score */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg"
                        style={{ background: `linear-gradient(135deg, ${launch.gradientFrom}, ${launch.gradientTo})` }}
                      >
                        {launch.initials}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base text-miau-white truncate">{launch.name}</h3>
                        <p className="text-sm text-miau-muted font-mono">${launch.catSymbol}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-xl shrink-0 ${getScoreBadgeClasses(launch.scoreTier)}`}>
                      {launch.scoreTier} {launch.score}
                    </span>
                  </div>

                  {/* Tier badge */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border ${tb.classes}`}>
                      <TierIcon size={12} />{tb.label}
                    </span>
                    {launch.vipEarlyAccess && (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-miau-pink/15 text-miau-pink border border-miau-pink/20">VIP 24hr Early</span>
                    )}
                    {isClosed && (
                      <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-miau-success/15 text-miau-success border border-miau-success/20">
                        <CheckCircle2 size={12} />Fully Subscribed
                      </span>
                    )}
                  </div>

                  {/* Edition breakdown */}
                  <p className="text-xs text-miau-muted font-semibold">
                    {launch.foundersTotal} Founders · {launch.limitedTotal} Limited · {launch.standardTotal} Standard
                  </p>

                  {/* Offering + yield */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-miau-muted mb-0.5">Offering</p>
                      <p className="text-sm font-bold text-miau-white">{launch.revenueSharePercent}% revenue — {launch.totalCATs} CATs</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-miau-muted mb-0.5">Est. Yield</p>
                      <p className="text-sm font-bold text-miau-success">{launch.estimatedYieldLow}–{launch.estimatedYieldHigh}%</p>
                    </div>
                  </div>

                  {/* Countdown or close date */}
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarDays size={14} className="text-miau-pink shrink-0" />
                    {isClosed ? (
                      <span className="text-miau-muted">Closed {new Date(launch.closeDate!).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    ) : isOpen ? (
                      <span className="text-miau-warning font-semibold">Closes {new Date(launch.closeDate!).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                    ) : (
                      <span className="text-miau-light font-semibold">Launches {new Date(launch.launchDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    )}
                  </div>

                  {/* Open now: subscription progress bar */}
                  {isOpen && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-miau-muted">Subscription Progress</span>
                        <span className="text-miau-light">{launch.catsSold} of {launch.totalCATs} CATs sold</span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-miau-dark-surface overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-miau-pink to-miau-pink-soft"
                          initial={{ width: 0 }}
                          animate={{ width: progressAnimated ? `${soldPercent}%` : 0 }}
                          transition={{ duration: 1.2, ease: 'easeOut' }}
                        />
                      </div>
                      <p className="text-xs text-miau-pink font-semibold">{soldPercent}% subscribed</p>
                    </div>
                  )}

                  {/* Closed: link to trade */}
                  {isClosed && (
                    <div className="bg-miau-success/10 border border-miau-success/20 rounded-xl px-4 py-3 text-center">
                      <p className="text-xs text-miau-success font-semibold mb-1">Fully subscribed in 3 days</p>
                      <Link
                        href="/trade"
                        onClick={() => setSelectedCreatorSlug(launch.slug)}
                        className="text-sm font-bold text-miau-success hover:text-miau-white transition-colors"
                      >
                        Now trading on secondary market →
                      </Link>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex items-center gap-3 pt-1">
                    {!isClosed && (
                      <button
                        onClick={() => toggleNotify(launch.id, launch.name)}
                        className={`p-2.5 rounded-xl transition-all ${
                          notified[launch.id]
                            ? 'bg-miau-success/15 text-miau-success border border-miau-success/20'
                            : 'bg-miau-dark-surface border border-miau-dark-border text-miau-muted hover:text-miau-white hover:bg-miau-dark-hover'
                        }`}
                        title={notified[launch.id] ? 'Notifications on' : 'Notify me'}
                      >
                        {notified[launch.id] ? <Bell size={16} /> : <BellOff size={16} />}
                      </button>
                    )}
                    <button
                      onClick={() => setDetailLaunch(launch)}
                      className="flex-1 text-center px-4 py-2.5 bg-miau-dark-surface border border-miau-dark-border rounded-xl text-sm font-bold text-miau-light hover:bg-miau-dark-hover hover:text-miau-white transition-all"
                    >
                      View Details
                    </button>
                    {isOpen && (
                      <button
                        onClick={() => showToast(`Purchase flow coming soon for ${launch.name}`)}
                        className="flex-1 text-center px-4 py-2.5 bg-miau-pink text-white rounded-xl text-sm font-bold hover:bg-miau-pink-soft shadow-glow transition-all"
                      >
                        Buy Now
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ═══════ MANAGED OFFERING CALLOUT ═══════ */}
      <div className="relative glass-card rounded-3xl overflow-hidden ring-1 ring-amber-500/30">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
        <div className="relative p-6 md:p-10 space-y-8">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Crown size={24} className="text-amber-400" />
              <h2 className="text-2xl md:text-3xl font-extrabold text-miau-white">
                Launch your CAT offering with the full Miauswap team behind you
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
                <Target size={22} className="text-amber-400" />
              </div>
              <h3 className="font-bold text-base text-miau-white">Pricing Advisory</h3>
              <p className="text-sm text-miau-muted leading-relaxed">
                We analyse your revenue trajectory and comparable offerings to set the right price across all edition tiers.
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
                <Megaphone size={22} className="text-amber-400" />
              </div>
              <h3 className="font-bold text-base text-miau-white">Marketing Campaign</h3>
              <p className="text-sm text-miau-muted leading-relaxed">
                Homepage placement, push notifications to our investor base, and social promotion timed for maximum impact.
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
                <Handshake size={22} className="text-amber-400" />
              </div>
              <h3 className="font-bold text-base text-miau-white">Investor Targeting</h3>
              <p className="text-sm text-miau-muted leading-relaxed">
                We match your offering to investors whose portfolios and preferences align with your creator profile.
              </p>
            </div>
          </div>

          <div className="text-center space-y-4">
            <p className="text-xs text-miau-muted">
              Managed Offering fee: 3–5% of capital raised. Standard 5% primary market buyer fee applies separately.
            </p>
            <button
              onClick={() => { setShowApplyModal(true); setApplySubmitted(false); }}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-black rounded-xl text-sm font-bold hover:from-amber-300 hover:to-yellow-400 transition-all shadow-lg"
            >
              <Crown size={16} />
              Apply for Managed Offering
            </button>
          </div>
        </div>
      </div>

      {/* ═══════ DETAIL MODAL ═══════ */}
      <AnimatePresence>
        {detailLaunch && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDetailLaunch(null)} />
            <motion.div
              className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-miau-dark-card border border-miau-dark-border rounded-3xl shadow-2xl"
              initial={{ scale: 0.95, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 30 }}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-miau-dark-border bg-miau-dark-card/95 backdrop-blur-md rounded-t-3xl">
                <h3 className="font-extrabold text-lg text-miau-white">{detailLaunch.name} — Launch Details</h3>
                <button onClick={() => setDetailLaunch(null)} className="p-2 rounded-xl hover:bg-miau-dark-hover text-miau-muted hover:text-miau-white transition-colors"><X size={20} /></button>
              </div>

              <div className="p-5 md:p-8 space-y-8">
                {/* Bio */}
                <div className="flex items-start gap-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${detailLaunch.gradientFrom}, ${detailLaunch.gradientTo})` }}
                  >
                    {detailLaunch.initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-mono text-miau-muted">${detailLaunch.catSymbol}</span>
                      {(() => { const tb = getTierBadge(detailLaunch.listingTier); const Icon = tb.icon; return <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg border ${tb.classes}`}><Icon size={12} />{tb.label}</span>; })()}
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg ${getScoreBadgeClasses(detailLaunch.scoreTier)}`}>{detailLaunch.score}</span>
                    </div>
                    <p className="text-sm text-miau-light mt-2 leading-relaxed">{detailLaunch.bio}</p>
                  </div>
                </div>

                {/* Edition pricing table */}
                <div>
                  <h4 className="font-bold text-sm text-miau-white mb-3 uppercase tracking-wide">Edition Breakdown</h4>
                  <div className="space-y-2">
                    {[
                      { name: 'Founders Edition', qty: detailLaunch.foundersTotal, price: detailLaunch.foundersPrice, perks: 'Private channel + 1-of-1 artwork + OG badge', cls: 'border-amber-500/30 bg-amber-500/5' },
                      { name: 'Limited Edition', qty: detailLaunch.limitedTotal, price: detailLaunch.limitedPrice, perks: 'Themed art series + bonus content', cls: 'border-miau-pink/30 bg-miau-pink/5' },
                      { name: 'Standard Edition', qty: detailLaunch.standardTotal, price: detailLaunch.standardPrice, perks: 'Creator branding + revenue claim', cls: 'border-miau-dark-border bg-miau-dark-surface/40' },
                    ].map(ed => (
                      <div key={ed.name} className={`rounded-xl border p-4 ${ed.cls}`}>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-miau-white">{ed.name}</span>
                          <span className="font-bold text-sm text-miau-white">{ed.qty} CATs · {ed.price} MIAU each</span>
                        </div>
                        <p className="text-xs text-miau-muted mt-1">{ed.perks}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Use of funds */}
                <div>
                  <h4 className="font-bold text-sm text-miau-white mb-2 uppercase tracking-wide">Use of Funds</h4>
                  <p className="text-sm text-miau-light leading-relaxed">{detailLaunch.useOfFunds}</p>
                </div>

                {/* Revenue history chart */}
                <div>
                  <h4 className="font-bold text-sm text-miau-white mb-3 uppercase tracking-wide">Revenue History (Last 3 Months)</h4>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={detailLaunch.revenueHistory}>
                        <defs>
                          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#FF2D78" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#FF2D78" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                        <Tooltip
                          contentStyle={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: '12px', fontSize: '12px' }}
                          formatter={(value: number | undefined) => [`$${(value ?? 0).toLocaleString()}`, 'Revenue']}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#FF2D78" strokeWidth={2} fill="url(#revGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Miau Creator Score breakdown */}
                <div>
                  <h4 className="font-bold text-sm text-miau-white mb-3 uppercase tracking-wide">Miau Creator Score Breakdown</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Revenue Stability', value: detailLaunch.revenueStability },
                      { label: 'Growth Trajectory', value: detailLaunch.growthTrajectory },
                      { label: 'Audience Size', value: detailLaunch.audienceSize },
                      { label: 'Tenure', value: detailLaunch.tenure },
                    ].map(s => (
                      <div key={s.label} className="bg-miau-dark-surface/60 rounded-xl p-3 border border-miau-dark-border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-miau-muted">{s.label}</span>
                          <span className="text-xs font-bold text-miau-white">{s.value}/100</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-miau-dark-surface overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-miau-pink to-miau-pink-soft" style={{ width: `${s.value}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Listing tier explanation (Managed only) */}
                {detailLaunch.listingTier === 'Managed' && (
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown size={16} className="text-amber-400" />
                      <span className="font-bold text-sm text-amber-400">Managed Offering</span>
                    </div>
                    <p className="text-sm text-miau-light leading-relaxed">
                      This offering is managed by the Miauswap team — pricing, marketing, and investor targeting are handled end-to-end.
                    </p>
                  </div>
                )}

                {/* CTA */}
                <div className="flex items-center gap-3 pt-2">
                  {detailLaunch.tab === 'open' ? (
                    <button
                      onClick={() => { showToast(`Purchase flow coming soon for ${detailLaunch.name}`); setDetailLaunch(null); }}
                      className="flex-1 text-center px-5 py-3.5 bg-miau-pink text-white rounded-xl text-sm font-bold hover:bg-miau-pink-soft shadow-glow transition-all"
                    >
                      Buy Now
                    </button>
                  ) : detailLaunch.tab === 'closed' ? (
                    <Link
                      href="/trade"
                      onClick={() => { setSelectedCreatorSlug(detailLaunch.slug); setDetailLaunch(null); }}
                      className="flex-1 text-center px-5 py-3.5 bg-miau-pink text-white rounded-xl text-sm font-bold hover:bg-miau-pink-soft shadow-glow transition-all"
                    >
                      Trade on Secondary Market
                    </Link>
                  ) : (
                    <button
                      onClick={() => { toggleNotify(detailLaunch.id, detailLaunch.name); }}
                      className={`flex-1 text-center px-5 py-3.5 rounded-xl text-sm font-bold transition-all ${
                        notified[detailLaunch.id]
                          ? 'bg-miau-success/15 text-miau-success border border-miau-success/25'
                          : 'bg-miau-pink text-white hover:bg-miau-pink-soft shadow-glow'
                      }`}
                    >
                      {notified[detailLaunch.id] ? "You'll be notified" : "I'm Interested — Notify Me"}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ APPLY FOR MANAGED OFFERING MODAL ═══════ */}
      <AnimatePresence>
        {showApplyModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowApplyModal(false)} />
            <motion.div
              className="relative w-full max-w-md bg-miau-dark-card border border-amber-500/30 rounded-3xl shadow-2xl"
              initial={{ scale: 0.95, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 30 }}
            >
              <div className="p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crown size={20} className="text-amber-400" />
                    <h3 className="font-extrabold text-lg text-miau-white">Apply for Managed Offering</h3>
                  </div>
                  <button onClick={() => setShowApplyModal(false)} className="p-2 rounded-xl hover:bg-miau-dark-hover text-miau-muted"><X size={18} /></button>
                </div>

                {applySubmitted ? (
                  <div className="text-center py-8 space-y-3">
                    <CheckCircle2 size={48} className="text-miau-success mx-auto" />
                    <h4 className="font-bold text-lg text-miau-white">Application Submitted!</h4>
                    <p className="text-sm text-miau-muted">Our team will review your application and get back to you within 48 hours.</p>
                    <button
                      onClick={() => setShowApplyModal(false)}
                      className="mt-4 px-6 py-2.5 bg-miau-dark-surface border border-miau-dark-border rounded-xl text-sm font-bold text-miau-light hover:bg-miau-dark-hover transition-all"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => { e.preventDefault(); setApplySubmitted(true); }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="text-xs font-semibold text-miau-muted uppercase tracking-wide block mb-1.5">Creator Name</label>
                      <input type="text" required placeholder="Your creator name" className="w-full px-4 py-3 bg-miau-dark-surface border border-miau-dark-border rounded-xl text-sm text-miau-white placeholder:text-miau-muted focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/50 transition-all" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-miau-muted uppercase tracking-wide block mb-1.5">Monthly Revenue (USD)</label>
                      <input type="number" required placeholder="e.g. 12000" className="w-full px-4 py-3 bg-miau-dark-surface border border-miau-dark-border rounded-xl text-sm text-miau-white placeholder:text-miau-muted focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/50 transition-all" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-miau-muted uppercase tracking-wide block mb-1.5">Desired Offering Size (CATs)</label>
                      <input type="number" required placeholder="e.g. 100" className="w-full px-4 py-3 bg-miau-dark-surface border border-miau-dark-border rounded-xl text-sm text-miau-white placeholder:text-miau-muted focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/50 transition-all" />
                    </div>
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-black rounded-xl text-sm font-bold hover:from-amber-300 hover:to-yellow-400 transition-all shadow-lg"
                    >
                      <Send size={16} />
                      Submit Application
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
