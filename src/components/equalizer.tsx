import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

export function Equalizer({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-end justify-center gap-[2px]', className)}>
      {[0, 0.2, 0.4].map((delay) => (
        <motion.span
          animate={{ height: ['40%', '100%', '40%'] }}
          className="w-[3px] rounded-full bg-red-500"
          key={delay}
          style={{ height: '40%' }}
          transition={{
            delay,
            duration: 0.6,
            ease: 'easeInOut',
            repeat: Number.POSITIVE_INFINITY,
          }}
        />
      ))}
    </div>
  )
}
