"use client"

import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

export default function DisconnectingLoader({ isDisconnecting }: { isDisconnecting: boolean }) {
  const containerVariants = {
    hidden: { y: 100, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: { 
      y: 100, 
      opacity: 0,
      transition: { 
        duration: 0.5,
        ease: "easeInOut"
      }
    }
  }

  const textVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        delay: 0.5,
        duration: 0.5
      }
    }
  }

  const dotVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        repeat: Infinity,
        repeatType: "reverse" as const,
        repeatDelay: 0.2
      }
    }
  }

  return (
    <AnimatePresence>
      {isDisconnecting && (
        <motion.div 
          className="fixed flex items-center justify-center bottom-0 right-0 h-16 w-full backdrop-blur-3xl p-4 bg-secondary/50 border-t border-secondary"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <Image
            className="mr-2"
            src="/linkedin.svg"
            alt="Twitter Logo"
            height={30}
            width={30}
          />
          <motion.span 
            className="text-sm font-ClashDisplayRegular"
            variants={textVariants}
            initial="hidden"
            animate="visible"
          >
            Disconnecting from Twitter
            <motion.span variants={dotVariants} initial="hidden" animate="visible">.</motion.span>
            <motion.span variants={dotVariants} initial="hidden" animate="visible" style={{ animationDelay: '0.2s' }}>.</motion.span>
            <motion.span variants={dotVariants} initial="hidden" animate="visible" style={{ animationDelay: '0.4s' }}>.</motion.span>
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
