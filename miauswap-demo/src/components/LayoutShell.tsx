'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { BarChart3, Search, Briefcase, Coins, Bell, Wallet, Menu, X, Sun, Moon, Rocket } from 'lucide-react';
import Image from 'next/image';
import { useApp } from '@/context/AppContext';
import NotificationDrawer from './NotificationDrawer';

const navItems = [
  { href: '/trade', label: 'Trade', icon: BarChart3 },
  { href: '/discover', label: 'Discover', icon: Search },
  { href: '/launches', label: 'Launches', icon: Rocket },
  { href: '/portfolio', label: 'Portfolio', icon: Briefcase },
  { href: '/wallet', label: 'Wallet', icon: Coins },
];

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { walletAddress, miauPrice, unreadCount, showNotifications, setShowNotifications, showAccessWarning, theme, toggleTheme } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-miau-dark">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-miau-dark-card/95 backdrop-blur-md border-b border-miau-dark-border h-16">
        <div className="flex items-center justify-between h-full px-4 lg:px-6">
          {/* Left: Logo + Mobile Menu */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-miau-dark-hover text-miau-muted"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link href="/trade" className="flex items-center gap-2">
              <Image
                src="/MIAU_Logo2_App_Icon.png"
                alt="MiauSwap"
                width={180}
                height={180}
                className="h-[45px] w-[45px] object-contain rounded-lg"
                priority
              />
              <span className="text-xl font-extrabold tracking-tight text-miau-white">miauswap</span>
            </Link>
          </div>

          {/* Centre: Page title (desktop) */}
          <div className="hidden md:block">
            <span className="text-sm text-miau-muted font-medium tracking-wide uppercase">
              {navItems.find(item => pathname.startsWith(item.href))?.label || 'Trade'}
            </span>
          </div>

          {/* Right: Price ticker + Wallet + Notifications */}
          <div className="flex items-center gap-3">
            {/* MIAU Price Ticker */}
            <div className="hidden sm:flex items-center gap-2 bg-miau-dark-surface px-4 py-2 rounded-xl border border-miau-dark-border">
              <span className="text-xs text-miau-muted font-medium">MIAU</span>
              <span className="font-mono text-sm font-bold text-miau-white">${miauPrice.toFixed(3)}</span>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl hover:bg-miau-dark-hover transition-colors"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <Sun size={20} className="text-miau-muted" />
              ) : (
                <Moon size={20} className="text-miau-muted" />
              )}
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-xl hover:bg-miau-dark-hover transition-colors"
            >
              <Bell size={20} className="text-miau-muted" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-miau-pink text-miau-white text-xs rounded-full flex items-center justify-center font-bold shadow-glow">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Wallet Address */}
            <Link
              href="/wallet"
              className="flex items-center gap-2 bg-miau-dark-surface border border-miau-dark-border px-3 py-2 rounded-xl hover:border-miau-pink/30 transition-all"
            >
              <Wallet size={16} className="text-miau-pink" />
              <span className="text-sm font-mono text-miau-light hidden sm:inline">{walletAddress}</span>
              <span className="w-2 h-2 rounded-full bg-miau-success animate-pulse-soft" title="Connected" />
            </Link>
          </div>
        </div>
      </header>

      {/* Notification Drawer */}
      <NotificationDrawer />

      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex fixed left-0 top-16 bottom-0 w-56 bg-miau-dark-card/80 backdrop-blur-md border-r border-miau-dark-border flex-col z-30">
        <nav className="flex-1 py-5 px-3 space-y-1">
          {navItems.map(item => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-miau-pink/15 text-miau-pink border border-miau-pink/20 shadow-glow'
                    : 'text-miau-muted hover:bg-miau-dark-hover hover:text-miau-white'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-miau-pink' : ''} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Wallet status at bottom */}
        <div className="p-3 border-t border-miau-dark-border">
          <Link href="/wallet" className="block">
            <div className="glass-card rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-miau-success animate-pulse-soft" />
                <span className="text-xs text-miau-muted font-medium">Connected</span>
              </div>
              <p className="font-mono text-xs text-miau-light">{walletAddress}</p>
              <p className="text-xs text-miau-muted mt-1">Base Network</p>
            </div>
          </Link>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
          <div className="w-72 bg-miau-dark-card h-full shadow-2xl border-r border-miau-dark-border" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-miau-dark-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image
                  src="/MIAU_Logo2_App_Icon.png"
                  alt="MiauSwap"
                  width={160}
                  height={160}
                  className="h-10 w-10 object-contain rounded-lg"
                />
                <span className="text-lg font-extrabold tracking-tight text-miau-white">miauswap</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-miau-muted">
                <X size={20} />
              </button>
            </div>
            <nav className="py-4 px-3 space-y-1">
              {navItems.map(item => {
                const isActive = pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-miau-pink/15 text-miau-pink'
                        : 'text-miau-muted hover:bg-miau-dark-hover hover:text-miau-white'
                    }`}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={`pt-16 lg:pl-56 min-h-screen ${showAccessWarning ? 'pt-28' : 'pt-16'}`}>
        <div className="p-4 lg:p-6">
          {children}
        </div>

        {/* Footer */}
        <footer className="border-t border-miau-dark-border mt-8 px-4 lg:px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-miau-muted">
              Miauswap is a product of Miau Social | Built on Base Network | Phase Two
            </p>
            <div className="flex items-center gap-4 text-xs text-miau-muted">
              <span className="hover:text-miau-pink cursor-pointer transition-colors">Whitepaper</span>
              <span className="hover:text-miau-pink cursor-pointer transition-colors">Terms</span>
              <span className="hover:text-miau-pink cursor-pointer transition-colors">Privacy</span>
              <span className="hover:text-miau-pink cursor-pointer transition-colors">Contact</span>
            </div>
          </div>
          <p className="text-xs text-miau-muted/60 mt-3 text-center">
            CATs are not securities. CATs represent revenue participation rights. This application is for demonstration purposes only.
          </p>
        </footer>
      </main>

      {/* Bottom nav (mobile) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-miau-dark-card/95 backdrop-blur-md border-t border-miau-dark-border z-40">
        <div className="flex items-center justify-around py-2">
          {navItems.slice(0, 5).map(item => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 transition-colors ${
                  isActive ? 'text-miau-pink' : 'text-miau-muted'
                }`}
              >
                <Icon size={20} />
                <span className="text-[10px] font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
