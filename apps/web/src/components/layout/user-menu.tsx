'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@web/stores/auth.store';
import { useRouter } from 'next/navigation';

export default function UserMenu() {
  const { user, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    router.push('/login');
    router.refresh();
  };

  // Get initials for avatar (e.g. "John Doe" -> "JD")
  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  const roleLabels: Record<string, string> = {
    superadmin: 'Super Admin',
    manager: 'Manager',
    staff: 'Staff',
    finance: 'Finance',
    warehouse: 'Warehouse',
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-1.5 rounded-lg hover:bg-accent transition-colors focus:outline-hidden cursor-pointer"
      >
        <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center font-bold text-primary-foreground text-sm shadow-xs">
          {initials}
        </div>
        <div className="hidden md:block text-left">
          <div className="text-xs font-semibold text-foreground">{user.name}</div>
          <div className="text-[10px] text-muted-foreground capitalize">
            {roleLabels[user.role] || user.role}
          </div>
        </div>
        <svg
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-popover text-popover-foreground p-2 shadow-2xl backdrop-blur-xl animate-in fade-in duration-100 z-50">
          <div className="px-3 py-2 border-b border-border mb-2">
            <p className="text-xs font-semibold text-foreground">{user.name}</p>
            <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
            <span className="inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
              {roleLabels[user.role] || user.role}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer text-left"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
