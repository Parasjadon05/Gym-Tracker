import {
  BowlFood,
  Calendar,
  Camera,
  ChartLineUp,
  ChartPie,
  Drop,
  ForkKnife,
  Lightning,
  Medal,
  Ruler,
  Scales,
  Timer,
} from '@phosphor-icons/react'

/**
 * Command-center stickers: pill + compact duotone — different look from landing blobs.
 */
export const DASHBOARD_STICKER_SETS = {
  exercise: [
    { id: 'e-intensity', icon: Lightning, color: '#f59e0b', label: 'Intensity' },
    { id: 'e-clock', icon: Timer, color: '#2dd4bf', label: 'Pace' },
    { id: 'e-pr', icon: Medal, color: '#a78bfa', label: 'PRs' },
    { id: 'e-trend', icon: ChartLineUp, color: '#38bdf8', label: 'Progress' },
  ],
  diet: [
    { id: 'd-meals', icon: ForkKnife, color: '#fbbf24', label: 'Meals' },
    { id: 'd-bowl', icon: BowlFood, color: '#4ade80', label: 'Plates' },
    { id: 'd-h2o', icon: Drop, color: '#22d3ee', label: 'Hydration' },
    { id: 'd-macro', icon: ChartPie, color: '#fb923c', label: 'Macros' },
  ],
  weekly: [
    { id: 'w-measure', icon: Ruler, color: '#94a3b8', label: 'Measure' },
    { id: 'w-photo', icon: Camera, color: '#e879f9', label: 'Photos' },
    { id: 'w-scale', icon: Scales, color: '#5eead4', label: 'Weight' },
    { id: 'w-log', icon: Calendar, color: '#818cf8', label: 'Timeline' },
  ],
}

/** First three deck icons — reused in the stats → panel bridge strip */
export function getDashboardBridgeIcons(section) {
  const set = DASHBOARD_STICKER_SETS[section] || DASHBOARD_STICKER_SETS.exercise
  return set.slice(0, 3).map(({ icon, color }) => ({ icon, color }))
}
