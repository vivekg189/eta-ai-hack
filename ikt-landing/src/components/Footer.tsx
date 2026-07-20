"use client";

import { motion } from "framer-motion";
import { Zap, Code2, MessageCircle, Link2, Mail } from "lucide-react";

const footerLinks = {
  Product: ["Features", "Pricing", "Roadmap", "Changelog", "Status"],
  Platform: ["Knowledge Twin", "AI Copilot", "Failure Genome", "Compliance AI", "Integrations"],
  Resources: ["Documentation", "API Reference", "Blog", "Case Studies", "Community"],
  Company: ["About", "Careers", "Contact", "Privacy Policy", "Terms of Service"],
};

const socialIcons = [Code2, MessageCircle, Link2, Mail];

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 pt-16 pb-8">
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <motion.div
              className="flex items-center gap-2 mb-4"
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg opacity-90" />
                <Zap className="absolute inset-0 m-auto w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white text-lg">
                IKT<span className="gradient-text-blue">.ai</span>
              </span>
            </motion.div>
            <p className="text-slate-500 text-sm leading-relaxed mb-4">
              The AI-powered Industrial Knowledge Twin platform that transforms operational
              intelligence.
            </p>
            <div className="flex gap-3">
              {socialIcons.map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  className="w-8 h-8 glass-card rounded-lg flex items-center justify-center border border-white/10 text-slate-400 hover:text-white hover:border-blue-500/50 transition-colors"
                  whileHover={{ scale: 1.1, y: -2 }}
                >
                  <Icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-white font-semibold text-sm mb-4">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="glass-card rounded-2xl p-6 border border-white/10 mb-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
            <div>
              <h4 className="text-white font-semibold mb-1">Stay ahead of industrial AI</h4>
              <p className="text-slate-400 text-sm">Weekly insights on industrial AI, knowledge management, and digital twins.</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <input
                type="email"
                placeholder="your@email.com"
                className="glass-card border border-white/20 rounded-xl px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 flex-1 sm:w-52"
              />
              <button className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-cyan-600 transition-all whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10">
          <p className="text-slate-500 text-sm">
            © 2025 Industrial Knowledge Twin (IKT). All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-slate-500 text-xs">All systems operational</span>
          </div>
          <div className="flex items-center gap-1 text-slate-500 text-xs">
            Built with ❤️ for Industrial Intelligence
          </div>
        </div>
      </div>
    </footer>
  );
}
