'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { BarChart3, Search, User, Briefcase, Coins, Settings, Bell, Wallet, Menu, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import NotificationDrawer from './NotificationDrawer';

const navItems = [
  { href: '/trade', label: 'CDEX Trading', icon: BarChart3 },
  { href: '/discover', label: 'Discover CATs', icon: Search },
  { href: '/creator/nella-rose', label: 'Creator Profiles', icon: User },
  { href: '/portfolio', label: 'My Portfolio', icon: Briefcase },
  { href: '/wallet', label: 'MIAU Token', icon: Coins },
];

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { walletAddress, miauPrice, unreadCount, showNotifications, setShowNotifications, showAccessWarning } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-miau-cream">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-miau-taupe h-16">
        <div className="flex items-center justify-between h-full px-4 lg:px-6">
          {/* Left: Logo + Mobile Menu */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-miau-pale"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link href="/trade" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-miau-pink to-miau-rose flex items-center justify-center">
                <span className="text-white font-bold text-sm">m</span>
              </div>
              <span className="font-serif italic text-xl text-miau-pink font-bold" style={{ textShadow: '0.5px 0.5px 0px #2C1810' }}>
                miauswap
              </span>
            </Link>
          </div>

          {/* Centre: Page title (desktop) */}
          <div className="hidden md:block">
            <span className="text-sm text-miau-rose-brown font-medium">
              {navItems.find(item => pathname.startsWith(item.href))?.label || 'CDEX Trading'}
            </span>
          </div>

          {/* Right: Price ticker + Wallet + Notifications */}
          <div className="flex items-center gap-3">
            {/* MIAU Price Ticker */}
            <div className="hidden sm:flex items-center gap-2 bg-miau-pale px-3 py-1.5 rounded-xl">
              <span className="text-xs text-miau-rose-brown">MIAU</span>
              <span className="font-mono text-sm font-semibold text-miau-brown">${miauPrice.toFixed(3)}</span>
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-miau-pale transition-colors"
            >
              <Bell size={20} className="text-miau-rose-brown" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-miau-dark text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Wallet Address */}
            <Link
              href="/wallet"
              className="flex items-center gap-2 bg-miau-blush px-3 py-1.5 rounded-xl hover:bg-miau-pink/30 transition-colors"
            >
              <Wallet size={16} className="text-miau-dark" />
              <span className="text-sm font-mono text-miau-brown hidden sm:inline">{walletAddress}</span>
              <span className="w-2 h-2 rounded-full bg-miau-success" title="Connected" />
            </Link>
          </div>
        </div>
      </header>

      {/* Notification Drawer */}
      <NotificationDrawer />

      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex fixed left-0 top-16 bottom-0 w-56 bg-white border-r border-miau-taupe flex-col z-30">
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map(item => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-miau-pink/20 text-miau-brown'
                    : 'text-miau-rose-brown hover:bg-miau-pale hover:text-miau-brown'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-miau-dark' : ''} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Wallet status at bottom */}
        <div className="p-3 border-t border-miau-taupe">
          <Link href="/wallet" className="block">
            <div className="bg-miau-blush rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-miau-success" />
                <span className="text-xs text-miau-rose-brown">Wallet Connected</span>
              </div>
              <p className="font-mono text-xs text-miau-brown">{walletAddress}</p>
              <p className="text-xs text-miau-rose-brown mt-1">Base Network</p>
            </div>
          </Link>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/30" onClick={() => setMobileMenuOpen(false)}>
          <div className="w-64 bg-white h-full shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-miau-taupe flex items-center justify-between">
              <span className="font-serif italic text-lg text-miau-pink font-bold">miauswap</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1">
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
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-miau-pink/20 text-miau-brown'
                        : 'text-miau-rose-brown hover:bg-miau-pale hover:text-miau-brown'
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
        <footer className="border-t border-miau-taupe mt-8 px-4 lg:px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-miau-rose-brown">
              Miauswap is a product of Miau Social | Built on Base Network | Phase Two
            </p>
            <div className="flex items-center gap-4 text-xs text-miau-rose-brown">
              <span className="hover:text-miau-dark cursor-pointer">Whitepaper</span>
              <span className="hover:text-miau-dark cursor-pointer">Terms</span>
              <span className="hover:text-miau-dark cursor-pointer">Privacy</span>
              <span className="hover:text-miau-dark cursor-pointer">Contact</span>
            </div>
          </div>
          <p className="text-xs text-miau-grey mt-3 text-center">
            CATs are not securities. CATs represent revenue participation rights. This application is for demonstration purposes only.
          </p>
        </footer>
      </main>

      {/* Bottom nav (mobile) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-miau-taupe z-40">
        <div className="flex items-center justify-around py-2">
          {navItems.slice(0, 5).map(item => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 ${
                  isActive ? 'text-miau-dark' : 'text-miau-rose-brown'
                }`}
              >
                <Icon size={18} />
                <span className="text-[10px]">{item.label.split(' ')[0]}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
