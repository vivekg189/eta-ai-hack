"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopNavbar } from "@/components/dashboard/TopNavbar";

const routeTitleMap: Record<string, string> = {
  "/dashboard": "Command Center",
  "/documents": "Document Intelligence Center",
  "/knowledge-twin": "Knowledge Twin",
  "/copilot": "Industrial Copilot",
  "/graph": "Knowledge Graph",
  "/failure-genome": "Failure Genome",
  "/knowledge-risk": "Knowledge Risk",
  "/compliance": "Compliance Intelligence",
  "/incidents": "Incident Time Machine",
  "/settings": "Settings",
};

export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Determine navbar title based on active path
  const title = routeTitleMap[pathname] || "Command Center";

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden" style={{ fontFamily: "var(--font-inter, system-ui, sans-serif)" }}>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-full">
        <Sidebar />
      </div>

      {/* Mobile Drawer (Responsive Navigation) */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
            {/* Sliding Menu drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="fixed inset-y-0 left-0 w-[240px] bg-white z-50 md:hidden shadow-2xl flex flex-col"
            >
              <Sidebar isMobile onClose={() => setMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <TopNavbar title={title} onMenuTriggerClick={() => setMobileOpen(true)} />
        
        {/* Page Content Panel */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
