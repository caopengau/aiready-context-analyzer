'use client';

import Image from 'next/image';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { motion } from 'framer-motion';

interface Props {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  activePage?: 'dashboard' | 'settings' | 'repo';
}

export default function Navbar({ user, activePage }: Props) {
  return (
    <header className="glass sticky top-0 z-20 border-b border-indigo-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center">
              <Image
                src="/logo-text-transparent-dark-theme.png"
                alt="AIReady"
                width={140}
                height={40}
                className="h-8 w-auto"
                priority
              />
            </Link>
            <nav className="hidden md:flex items-center gap-6 ml-6">
              <Link
                href="/dashboard"
                className={`text-sm font-medium transition-colors ${
                  activePage === 'dashboard'
                    ? 'text-cyan-400 border-b-2 border-cyan-400 pb-0.5'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/settings"
                className={`text-sm font-medium transition-colors ${
                  activePage === 'settings'
                    ? 'text-cyan-400 border-b-2 border-cyan-400 pb-0.5'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Settings
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {user.image && (
              <img
                src={user.image}
                alt={user.name || 'User'}
                className="w-8 h-8 rounded-full border-2 border-cyan-500/50"
              />
            )}
            <span className="text-sm text-slate-300 hidden sm:block">
              {user.name || user.email}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-sm text-slate-400 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/10"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
