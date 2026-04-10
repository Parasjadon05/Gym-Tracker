import {
  Barbell,
  DropHalf,
  PersonSimpleRun,
  Sneaker,
} from '@phosphor-icons/react'

/** Phosphor duotone icons — designed assets, not ad-hoc rectangles */
export const GYM_STICKER_ICONS = [
  {
    id: 'strength',
    icon: Barbell,
    color: '#ea580c',
    frameBg: 'linear-gradient(145deg, #fff7ed 0%, #ffedd5 100%)',
  },
  {
    id: 'sessions',
    icon: Sneaker,
    color: '#0d9488',
    frameBg: 'linear-gradient(145deg, #ecfdf5 0%, #d1fae5 100%)',
  },
  {
    id: 'movement',
    icon: PersonSimpleRun,
    color: '#2563eb',
    frameBg: 'linear-gradient(145deg, #eff6ff 0%, #dbeafe 100%)',
  },
  {
    id: 'hydrate',
    icon: DropHalf,
    color: '#0891b2',
    frameBg: 'linear-gradient(145deg, #ecfeff 0%, #cffafe 100%)',
  },
]
