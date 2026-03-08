import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

interface FlipButtonProps {
  text1: string
  text2: string
  className?: string
  onClick?: () => void
}

export function FlipButton({ text1, text2, className, onClick }: FlipButtonProps) {
  const [show, setShow] = useState(false)
  
  const flipVariants = {
    one: {
      rotateX: 0,
      backgroundColor: '#3b82f6',
      color: '#ffffff',
    },
    two: {
      rotateX: 180,
      backgroundColor: '#f4f4f5',
      color: '#18181b',
    },
  }

  const handleClick = () => {
    setShow(!show)
    onClick?.()
  }

  return (
    <div className={cn("w-full", className)}>
      <motion.button
        className="w-full cursor-pointer px-5 py-2.5 font-medium text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        style={{
          borderRadius: 999,
        }}
        onClick={handleClick}
        animate={show ? 'two' : 'one'}
        variants={flipVariants}
        transition={{ duration: 0.6, type: 'spring' }}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
      >
        <motion.div
          animate={{ rotateX: show ? 180 : 0 }}
          transition={{ duration: 0.6, type: 'spring' }}
          style={{ perspective: '1000px' }}
        >
          {show ? text1 : text2}
        </motion.div>
      </motion.button>
    </div>
  )
}