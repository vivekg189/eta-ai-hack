"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Bell, Settings, User, ChevronDown, Zap, Menu } from "lucide-react";

interface TopNavbarProps {
  title?: string;
  onMenuTriggerClick?: () => void;
}

export function TopNavbar({ title = "Dashboard", onMenuTriggerClick }: TopNavbarProps) {
  const [searchFocused, setSearchFocused] = useState(false);

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-3">
          {onMenuTriggerClick && (
            <button
              onClick={onMenuTriggerClick}
              className="md:hidden p-1.5 -ml-1 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-lg font-bold text-slate-800">{title}</h1>
            <p className="text-xs text-slate-400">{dateStr}</p>
          </div>
          {/* Plant Status */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
            <div className="relative w-2 h-2">
              <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-60" />
              <div className="w-2 h-2 rounded-full bg-green-500" />
            </div>
            <span className="text-xs font-semibold text-green-700">Plant: Operational</span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <motion.div
            animate={{ width: searchFocused ? 240 : 180 }}
            transition={{ duration: 0.25 }}
            className="relative hidden md:block"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search assets..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white transition-all"
            />
          </motion.div>

          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <Bell className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </motion.button>

          {/* Settings */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <Settings className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
          </motion.button>

          {/* User */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-sm shadow-blue-200"
          >
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold hidden sm:block">Admin</span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </motion.button>
        </div>
      </div>
    </header>
  );
}
