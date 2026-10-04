import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  LayoutDashboard,
  FileText,
  Users,
  Activity,
  Download,
  Settings,
  LogOut,
  X,
  History,
  LogIn,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
  const { user, logout, isMasterAdmin, isAdmin } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully.');
      navigate('/login');
    } catch {
      navigate('/login');
    }
  };

  const navItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      allowed: true, // Everyone
    },
    {
      label: 'Funeral Cases',
      path: '/cases',
      icon: FileText,
      allowed: true, // Everyone
    },
    {
      label: 'User Management',
      path: '/users',
      icon: Users,
      allowed: isMasterAdmin, // Master Admin only
    },
    {
      label: 'User Monitoring',
      path: '/monitoring',
      icon: Activity,
      allowed: isMasterAdmin, // Master Admin only
    },
    {
      label: 'Activity Log',
      path: '/activity-log',
      icon: History,
      allowed: isMasterAdmin, // Master Admin only
    },
    {
      label: 'Login History',
      path: '/login-history',
      icon: LogIn,
      allowed: isMasterAdmin, // Master Admin only
    },
    {
      label: 'Reports & Export',
      path: '/reports',
      icon: Download,
      allowed: isMasterAdmin || isAdmin, // Master Admin and Admin
    },
    {
      label: 'System Settings',
      path: '/settings',
      icon: Settings,
      allowed: true, // Everyone
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-black border-r border-zinc-800 flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'w-64 lg:w-20' : 'w-64'}`}
      >
        {/* Desktop Floating Tab Button on Border */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden lg:flex absolute -right-3 top-5 w-6 h-6 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-black hover:bg-white hover:border-white shadow-md items-center justify-center transition-all z-50 focus:outline-none"
          title={isCollapsed ? 'Maximize sidebar' : 'Minimize sidebar'}
          aria-label={isCollapsed ? 'Maximize sidebar' : 'Minimize sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Brand Header */}
        <div
          className={`h-16 border-b border-zinc-800 flex items-center transition-all duration-300 ${
            isCollapsed
              ? 'px-4 lg:px-0 lg:justify-center justify-between'
              : 'px-4 justify-between'
          }`}
        >
          {/* Collapsed view on desktop: Clickable logo mark that can maximize */}
          {isCollapsed ? (
            <>
              {/* Desktop Collapsed Brand Icon */}
              <div
                onClick={onToggleCollapse}
                className="hidden lg:flex w-9 h-9 rounded-xl bg-white text-black items-center justify-center font-serif-brand font-bold text-base shadow-sm cursor-pointer hover:scale-105 transition-transform"
                title="ALAALA Funeral Homes - Click to Maximize"
              >
                A
              </div>

              {/* Mobile Drawer Header (when opened on mobile) */}
              <div className="flex lg:hidden items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-serif-brand font-bold text-base shadow-sm">
                  A
                </div>
                <div>
                  <h2 className="text-sm font-bold tracking-widest text-white font-serif-brand leading-none">
                    ALAALA
                  </h2>
                  <p className="text-[10px] text-zinc-400 font-medium tracking-wider uppercase mt-1 leading-none">
                    Funeral Homes
                  </p>
                </div>
              </div>
            </>
          ) : (
            /* Maximized view: Full logo + name */
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-serif-brand font-bold text-base shadow-sm shrink-0">
                A
              </div>
              <div className="truncate">
                <h2 className="text-sm font-bold tracking-widest text-white font-serif-brand leading-none">
                  ALAALA
                </h2>
                <p className="text-[10px] text-zinc-400 font-medium tracking-wider uppercase mt-1 leading-none">
                  Funeral Homes
                </p>
              </div>
            </div>
          )}

          {/* Action buttons on header right */}
          <div className="flex items-center gap-1">
            {/* Desktop Minimize Button (visible only when maximized) */}
            {!isCollapsed && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="hidden lg:flex p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg transition"
                title="Minimize sidebar"
                aria-label="Minimize sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg lg:hidden"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-none">
          {/* Main Menu Label / Divider */}
          {isCollapsed ? (
            <>
              <div className="my-2 border-t border-zinc-800/80 mx-2 hidden lg:block" />
              <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500 lg:hidden">
                Main Menu
              </div>
            </>
          ) : (
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Main Menu
            </div>
          )}

          {navItems
            .filter((item) => item.allowed)
            .map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={item.label}
                  onClick={() => {
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={({ isActive }) =>
                    `group relative flex items-center rounded-xl text-sm font-medium transition duration-150 ${
                      isCollapsed
                        ? 'lg:justify-center lg:w-11 lg:h-11 lg:p-0 mx-auto px-3.5 py-2.5 gap-3'
                        : 'gap-3 px-3.5 py-2.5'
                    } ${
                      isActive
                        ? 'bg-white text-black font-semibold shadow-sm border border-white'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent'
                    }`
                  }
                >
                  <Icon
                    className={`shrink-0 ${
                      isCollapsed ? 'w-5 h-5 lg:w-5 lg:h-5' : 'w-4 h-4'
                    }`}
                  />
                  <span className={`truncate ${isCollapsed ? 'lg:hidden' : 'inline'}`}>
                    {item.label}
                  </span>
                </NavLink>
              );
            })}
        </div>

        {/* Sidebar Footer with Role Status and Logout */}
        {isCollapsed ? (
          <>
            {/* Desktop Minimized Footer */}
            <div className="hidden lg:flex p-3 border-t border-zinc-800 bg-zinc-950/60 flex-col items-center gap-2">
              <div
                className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-bold text-xs flex items-center justify-center uppercase cursor-default"
                title={`${user?.full_name || user?.username} (${
                  isMasterAdmin ? 'Master Admin' : isAdmin ? 'Admin' : 'Staff'
                })`}
              >
                {user?.full_name ? user.full_name.charAt(0) : 'U'}
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl transition"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Drawer Footer */}
            <div className="lg:hidden p-4 border-t border-zinc-800 bg-zinc-950/60">
              <div className="mb-3 px-2 flex items-center justify-between text-xs text-zinc-400">
                <span className="truncate text-white font-medium">{user?.full_name || user?.username}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800 font-semibold uppercase">
                  {isMasterAdmin ? 'MASTER' : isAdmin ? 'ADMIN' : 'STAFF'}
                </span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </>
        ) : (
          /* Maximized Footer */
          <div className="p-4 border-t border-zinc-800 bg-zinc-950/60">
            <div className="mb-3 px-2 flex items-center justify-between text-xs text-zinc-400">
              <div className="truncate max-w-[135px]">
                <p className="truncate text-white font-medium text-xs">
                  {user?.full_name || user?.username}
                </p>
                <p className="text-[10px] text-zinc-500 truncate">
                  {user?.email || 'Logged In'}
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800 font-semibold uppercase shrink-0">
                {isMasterAdmin ? 'MASTER' : isAdmin ? 'ADMIN' : 'STAFF'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
