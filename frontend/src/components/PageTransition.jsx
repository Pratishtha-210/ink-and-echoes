import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { playPageTurnSound } from '../utils/soundEffects.js';

const PageTransition = ({ children }) => {
  useEffect(() => {
    playPageTurnSound();
  }, []); // Play sound on page transition mount

  return (
    <div className="w-full relative min-h-[75vh]" style={{ perspective: '1600px' }}>
      {/* 3D Book Page Flip Animation */}
      <motion.div
        initial={{ 
          rotateY: 90, 
          opacity: 0, 
          transformOrigin: 'left center',
          scale: 0.98
        }}
        animate={{ 
          rotateY: 0, 
          opacity: 1, 
          scale: 1
        }}
        exit={{ 
          rotateY: -90, 
          opacity: 0, 
          transformOrigin: 'left center',
          scale: 0.98
        }}
        transition={{ 
          duration: 0.7, 
          ease: [0.25, 1, 0.5, 1] // Custom cubic-bezier for a natural fluid page-flip decay
        }}
        className="w-full h-full relative bg-luxury-bg/35 rounded-r-3xl border-l-2 border-luxury-gold/30 pl-4 md:pl-8"
      >
        {/* Shadow simulation on page-flip */}
        <motion.div 
          initial={{ opacity: 0.4 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0.4 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0 bg-black pointer-events-none rounded-r-3xl"
        />

        {/* Dynamic page curl accent on the right border */}
        <div className="absolute right-0 top-0 bottom-0 w-[3px] bg-gradient-to-r from-transparent to-white/5 pointer-events-none rounded-r-3xl" />
        
        {children}
      </motion.div>
    </div>
  );
};

export default PageTransition;
