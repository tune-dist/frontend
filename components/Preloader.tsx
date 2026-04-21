'use client'

import React from 'react'
import { motion } from 'framer-motion'

export const Preloader = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#030303]">
      <div className="relative flex flex-col items-center">
        
        {/* Simple Rotate Circle Animation */}
        <div className="relative w-12 h-12">
          {/* Static Track */}
          <div className="absolute inset-0 border-2 border-white/5 rounded-full" />
          
          {/* Animated Spinner Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ 
              duration: 1, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="absolute inset-0 border-2 border-t-emerald-500 border-r-transparent border-b-transparent border-l-transparent rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          />
        </div>

        {/* Minimal Text (Optional, keeping it subtle) */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-6 text-[10px] uppercase tracking-[0.4em] font-medium text-white"
        >
          Loading
        </motion.p>

      </div>
    </div>
  )
}

export default Preloader
