import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { RoleBadge } from './BadgesAndCards';
import {
  Search,
  LogOut,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

export const Navbar = ({
  onToggleSidebar,
  isSidebarOpen,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { user, logout, isIdle } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    navigate(`/cases?search=${encodeURIComponent(query)}`);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully.');
      navigate('/login');
    } catch {
      toast.error('Logout error, session ended.');
      navigate('/login');
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-zinc-800 bg-black/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Brand indicator */}
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl transition lg:hidden"
          aria-label="Toggle navigation"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Desktop Sidebar Collapse / Expand Toggle */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden lg:flex p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800 rounded-xl transition"
          title={isCollapsed ? 'Maximize sidebar' : 'Minimize sidebar'}
          aria-label="Toggle sidebar collapse"
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>

        <div className="hidden sm:block">
          <span className="text-xs uppercase font-serif-brand tracking-widest text-white font-semibold block">
            ALAALA FUNERAL HOMES
          </span>
          <span className="text-[10px] text-zinc-400 tracking-wider font-medium">
            FUNERAL MANAGEMENT SYSTEM
          </span>
        </div>
      </div>

      {/* Center: Global Case Number Search */}
      <div className="flex-1 max-w-md mx-2">
        <form onSubmit={handleSearch} className="relative flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter Case Number or Deceased Name..."
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-400 rounded-xl pl-10 pr-20 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400/20 transition"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 pointer-events-none" />
          <button
            type="submit"
            className="absolute right-1.5 px-3 py-1 bg-white hover:bg-zinc-200 text-black font-bold text-xs rounded-lg transition"
          >
            SEARCH
          </button>
        </form>
      </div>

      {/* Right: User Profile & Actions */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Active / Idle Indicator */}
        <div
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border bg-zinc-900 text-zinc-300 border-zinc-800"
          title={isIdle ? 'User is currently Idle' : 'User is currently Active'}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isIdle ? 'bg-zinc-500' : 'bg-emerald-400 animate-pulse'
            }`}
          />
          <span>{isIdle ? 'IDLE' : 'ACTIVE'}</span>
        </div>

        {/* User Card */}
        <div className="flex items-center gap-3 pl-2 border-l border-zinc-800">
          <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white font-bold text-xs uppercase">
            {user?.full_name ? user.full_name.charAt(0) : 'U'}
          </div>

          <div className="hidden lg:block text-left">
            <div className="text-xs font-semibold text-zinc-200 truncate max-w-[130px]">
              {user?.full_name || user?.username}
            </div>
            <div className="mt-0.5">
              <RoleBadge role={user?.role} />
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl transition border border-transparent hover:border-zinc-800"
          title="Logout from system"
          aria-label="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
