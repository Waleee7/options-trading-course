"use client";

import { motion, AnimatePresence } from "framer-motion";

interface XpPopupProps {
  xp: number;
  show: boolean;
}

export default function XpPopup({ xp, show }: XpPopupProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed top-20 right-8 z-50"
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.8 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/40 rounded-xl px-6 py-3 backdrop-blur-md">
            <span className="text-2xl font-bold text-yellow-400">+{xp} XP</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
