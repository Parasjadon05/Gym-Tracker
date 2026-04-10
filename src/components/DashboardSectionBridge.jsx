import { getDashboardBridgeIcons } from '../data/dashboardStickerIcons'

/**
 * Fills the space between stats and main panel: hairline + tiny marks (not dead air).
 */
export default function DashboardSectionBridge({ section = 'exercise' }) {
  const marks = getDashboardBridgeIcons(section)

  return (
    <div className="dashboard-section-bridge" aria-hidden>
      <span className="dashboard-section-bridge__rule" />
      <div className="dashboard-section-bridge__marks">
        {marks.map((m, i) => {
          const Icon = m.icon
          return <Icon key={i} size={17} weight="duotone" color={m.color} />
        })}
      </div>
      <span className="dashboard-section-bridge__rule" />
    </div>
  )
}
