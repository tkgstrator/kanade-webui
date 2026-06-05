import { Pause, Play } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { useAudioPlayer } from '@/hooks/use-audio-player'
import { formatDuration } from '@/lib/utils'

export function MiniPlayer() {
  const { currentTrack, isPlaying, progress, duration, toggle, seek } = useAudioPlayer()

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (duration <= 0) return
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const ratio = x / rect.width
      seek(ratio * duration)
    },
    [duration, seek],
  )

  const handleProgressKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (duration <= 0) return
      const step = 5
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        seek(Math.min(progress + step, duration))
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        seek(Math.max(progress - step, 0))
      } else if (e.key === 'Home') {
        e.preventDefault()
        seek(0)
      } else if (e.key === 'End') {
        e.preventDefault()
        seek(duration)
      }
    },
    [duration, progress, seek],
  )

  return (
    <AnimatePresence>
      {currentTrack && (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="fixed right-0 bottom-0 left-0 z-50 border-t border-border/40 bg-background/80 backdrop-blur-xl"
          exit={{ opacity: 0, y: 64 }}
          initial={{ opacity: 0, y: 64 }}
          transition={{ damping: 25, stiffness: 300, type: 'spring' }}
        >
          {/* プログレスバー */}
          <div
            aria-label="シーク"
            aria-valuemax={duration}
            aria-valuemin={0}
            aria-valuenow={progress}
            className="group h-1 w-full cursor-pointer bg-muted/60 transition-[height] hover:h-2"
            onClick={handleProgressClick}
            onKeyDown={handleProgressKeyDown}
            role="slider"
            tabIndex={0}
          >
            <motion.div
              className="h-full bg-red-500"
              style={{ width: duration > 0 ? `${(progress / duration) * 100}%` : '0%' }}
              transition={{ duration: 0.1 }}
            />
          </div>

          <div className="flex h-16 items-center gap-3 px-4">
            {/* アートワーク */}
            <img
              alt={currentTrack.name}
              className="size-10 rounded-md object-cover shadow-sm"
              draggable={false}
              src={currentTrack.artworkUrl}
            />

            {/* 曲情報 */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{currentTrack.name}</p>
              <p className="truncate text-xs text-muted-foreground">{currentTrack.artistName}</p>
            </div>

            {/* 時間表示 */}
            <span className="hidden shrink-0 text-xs tabular-nums text-muted-foreground sm:block">
              {formatDuration(progress * 1000)} / {formatDuration(duration * 1000)}
            </span>

            {/* 再生/停止ボタン */}
            <Button className="size-9 rounded-full" onClick={toggle} size="icon" variant="ghost">
              {isPlaying ? (
                <Pause className="size-5" fill="currentColor" />
              ) : (
                <Play className="size-5" fill="currentColor" />
              )}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
