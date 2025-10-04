import React from 'react';
import { motion } from 'framer-motion';

/*
  LogoReveal Animation Timeline (Total ~2.0s):
  0.0s - 0.8s : Logo appears centered (pause)
  0.8s - 1.4s : Logo slides left to final navbar-like position
  1.4s - 2.0s : Text "LocalHands" fades & slides/scales in
  2.0s +      : Subtle breathing animation on the whole group (optional)
*/

const LogoReveal = ({ onComplete }) => {
  // Variants for the circular logo (LH)
  const logoVariants = {
    initial: { x: '-50%', y: '-50%', left: '50%', top: '50%', position: 'fixed' },
    hold: {
      transition: { duration: 0.8 }
    },
    slideLeft: {
      left: 24,
      top: 16,
      x: 0,
      y: 0,
      transition: { delay: 0.0, duration: 0.6, ease: [0.22, 1.02, 0.36, 1] }
    },
    final: {
      transitionEnd: { position: 'relative', left: 'auto', top: 'auto' }
    }
  };

  // Variants for the brand text
  const textVariants = {
    hidden: { opacity: 0, x: 24, scale: 0.8 }, // Option C (scale + fade + slight slide)
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { duration: 0.6, ease: 'easeOut', delay: 1.4 }
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[999] flex items-start"
      initial="initial"
      animate="hold"
    >
      {/* Logo wrapper orchestrates later states via sequence */}
      <motion.div
        className="w-16 h-16 bg-gradient-to-br from-brand-primary to-blue-600 dark:from-blue-500 dark:to-blue-700 rounded-2xl flex items-center justify-center shadow-lg text-white font-bold text-xl"
        variants={logoVariants}
        animate="slideLeft"
        onAnimationComplete={() => {
          // After slideLeft completes (at ~1.4s), trigger a final small delay then show text
          // We rely on the text variant delay for timing. Once its animation ends (~2.0s) call onComplete.
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 2000 - 1400); // remaining time until ~2.0s mark
        }}
      >
        LH
      </motion.div>
      <motion.span
        className="pl-3 pr-4 pt-4 text-2xl font-bold text-white select-none"
        variants={textVariants}
        initial="hidden"
        animate="visible"
      >
        LocalHands
      </motion.span>
    </motion.div>
  );
};

export default LogoReveal;
