import { motion, useReducedMotion } from 'framer-motion'
import { GYM_STICKER_ICONS } from '../data/gymStickerIcons'
import { StickerBlob, StickerTrackIllustration } from './GymStickerArt'

const MotionDiv = motion.div

const GUTTER_LANDING = [
  { size: 'sticker--md', pos: 'sticker--gutter-left' },
  { size: 'sticker--md', pos: 'sticker--gutter-right-t' },
  { size: 'sticker--lg', pos: 'sticker--gutter-right-b' },
  { size: 'sticker--sm', pos: 'sticker--gutter-left-m' },
]

function floatMotion(reduceMotion, { duration = 5, y = 8, rotate = 3 } = {}) {
  if (reduceMotion) return {}
  return {
    animate: {
      y: [0, -y, 0],
      rotate: [0, rotate * 0.35, -rotate * 0.28, 0],
    },
    transition: {
      duration,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  }
}

/**
 * In-flow strip — organic blob stickers + large flat icons (not boxed tiles).
 */
export function LandingStickerStrip() {
  const reduceMotion = useReducedMotion()
  const bob =
    reduceMotion
      ? {}
      : {
          animate: { y: [0, -5, 0] },
          transition: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' },
        }

  return (
    <section className="landing-sticker-strip" aria-hidden>
      <p className="landing-sticker-strip__label">Flat illustrations</p>
      <div className="landing-sticker-strip__row">
        {GYM_STICKER_ICONS.map((item, i) => (
          <MotionDiv key={item.id} className="sticker-strip-item" {...bob}>
            <StickerBlob
              icon={item.icon}
              color={item.color}
              frameBg={item.frameBg}
              blobIndex={i}
            />
          </MotionDiv>
        ))}
      </div>
      <div className="landing-sticker-strip__track">
        <StickerTrackIllustration />
      </div>
    </section>
  )
}

/**
 * Fixed viewport gutters — wide screens only (see CSS).
 */
export default function GymStickers({ variant = 'landing' }) {
  const reduceMotion = useReducedMotion()
  const floatDurations = [5.5, 4.8, 6.2, 5]

  if (variant === 'login') {
    return (
      <div className="sticker-layer sticker-layer--login" aria-hidden>
        {GYM_STICKER_ICONS.slice(0, 2).map((item, i) => (
          <MotionDiv
            key={item.id}
            className={`sticker sticker--sm ${i === 0 ? 'sticker-login--tl' : 'sticker-login--br'}`}
            {...floatMotion(reduceMotion, { duration: i ? 5.1 : 4.2, y: 6 + i, rotate: 4 })}
          >
            <StickerBlob icon={item.icon} color={item.color} frameBg={item.frameBg} blobIndex={i} />
          </MotionDiv>
        ))}
      </div>
    )
  }

  return (
    <div className="sticker-layer sticker-layer--landing" aria-hidden>
      {GYM_STICKER_ICONS.map((item, i) => (
        <MotionDiv
          key={item.id}
          className={`sticker ${GUTTER_LANDING[i].size} ${GUTTER_LANDING[i].pos}`}
          {...floatMotion(reduceMotion, { duration: floatDurations[i], y: 8 + (i % 2), rotate: 4 + i })}
        >
          <StickerBlob icon={item.icon} color={item.color} frameBg={item.frameBg} blobIndex={i} />
        </MotionDiv>
      ))}
    </div>
  )
}
