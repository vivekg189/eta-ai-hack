"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileText, Brain, Bot, Network, Dna,
  ShieldAlert, Scale, History, Settings, Zap, ChevronLeft,
  ChevronRight, X
} from "lucide-react";
import { navItems } from "@/lib/dashboard-data";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, FileText, Brain, Bot, Network, Dna,
  ShieldAlert, Scale, History, Settings,
};

interface SidebarProps {
  activeItem?: string;
  onItemClick?: (id: string) => void;
  isMobile?: boolean;
  onClose?: () => void;
}

export function Sidebar({ activeItem, onItemClick, isMobile = false, onClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const handleItemClick = (item: typeof navItems[0]) => {
    if (onItemClick) {
      onItemClick(item.id);
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <motion.aside
      animate={{ width: isMobile ? "100%" : collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`relative flex flex-col h-full bg-white border-r border-slate-200 shadow-lg z-30 overflow-hidden flex-shrink-0`}
    >
      {/* Logo & Close for Mobile */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl opacity-95 shadow-md" />
            <Zap className="absolute inset-0 m-auto w-5 h-5 text-white" />
          </div>
          {(!collapsed || isMobile) && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <div className="font-bold text-slate-800 text-sm leading-tight font-sans">Industrial</div>
              <div className="text-xs text-blue-600 font-semibold font-sans">Knowledge Twin</div>
            </motion.div>
          )}
        </div>
        {isMobile && onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
        <div className="space-y-0.5 px-2">
          {navItems.map((item) => {
            const Icon = iconMap[item.icon];
            const isActive = activeItem
              ? activeItem === item.id
              : pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));

            return (
              <Link href={item.href} key={item.id} className="block w-full">
                <motion.div
                  onClick={() => handleItemClick(item)}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-200"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl"
                      transition={{ duration: 0.2 }}
                    />
                  )}
                  <div className="relative z-10 flex-shrink-0">
                    {Icon && <Icon className="w-[18px] h-[18px]" />}
                  </div>
                  <AnimatePresence>
                    {(!collapsed || isMobile) && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative z-10 text-sm font-medium whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Collapse Toggle */}
      {!isMobile && (
        <div className="p-3 border-t border-slate-100 flex-shrink-0">
          <motion.button
            onClick={() => setCollapsed(!collapsed)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors text-xs font-medium"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse</span>
              </>
            )}
          </motion.button>
        </div>
      )}
    </motion.aside>
  );
}
