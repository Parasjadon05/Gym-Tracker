import { motion, useReducedMotion } from 'framer-motion'
import { DASHBOARD_STICKER_SETS } from '../data/dashboardStickerIcons'

const MotionDiv = motion.div

/**
 * Dashboard-only: horizontal HUD pills + tiny labels (not landing blob stickers).
 */
export default function DashboardStickerDeck({ section = 'exercise', consistencyBadge = '' }) {
  const reduceMotion = useReducedMotion()
  const items = DASHBOARD_STICKER_SETS[section] || DASHBOARD_STICKER_SETS.exercise

  return (
    <div className="dashboard-sticker-deck-wrap" aria-hidden>
      <p className="dashboard-sticker-deck__title">Session vibe</p>
      <div className="dashboard-sticker-row">
        <div className="dashboard-sticker-deck">
          {items.map((item, i) => {
            const Icon = item.icon
            return (
              <MotionDiv
                key={item.id}
                className="dashboard-sticker-pill"
                initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduceMotion ? 0 : 0.04 * i, duration: 0.28 }}
              >
                <span className="dashboard-sticker-pill__glyph">
                  <Icon size={22} weight="duotone" color={item.color} aria-hidden />
                </span>
                <span className="dashboard-sticker-pill__label">{item.label}</span>
              </MotionDiv>
            )
          })}
        </div>
        {consistencyBadge && (
          <span className="dashboard-consistency-chip">{consistencyBadge}</span>
        )}
      </div>
    </div>
  )
}
