const ICON_PX = 96

/** Irregular “blob” silhouettes — not boxes — each slightly different (flat-illustration vibe). */
const BLOB_MAIN = [
  '59% 41% 48% 52% / 53% 47% 51% 49%',
  '42% 58% 55% 45% / 48% 42% 58% 52%',
  '52% 48% 42% 58% / 44% 56% 48% 52%',
  '48% 52% 52% 48% / 58% 42% 46% 54%',
]

const BLOB_UNDER = [
  '48% 52% 61% 39% / 45% 55% 50% 50%',
  '55% 45% 48% 52% / 52% 48% 54% 46%',
  '45% 55% 52% 48% / 47% 53% 49% 51%',
  '52% 48% 45% 55% / 50% 50% 52% 48%',
]

/**
 * Soft, organic sticker — layered shapes + large icon (reference: flat vector, not boxed UI).
 */
export function StickerBlob({ icon, color, frameBg, blobIndex = 0, className = '' }) {
  const StickerIcon = icon
  const i = blobIndex % BLOB_MAIN.length
  const mainR = BLOB_MAIN[i]
  const underR = BLOB_UNDER[i]

  return (
    <div className={`sticker-blob ${className}`.trim()}>
      <div
        className="sticker-blob__under"
        aria-hidden
        style={{
          borderRadius: underR,
          transform: `rotate(${-6 + i * 4}deg)`,
          background:
            'linear-gradient(155deg, rgba(255, 255, 255, 0.1) 0%, rgba(15, 23, 42, 0.5) 45%, rgba(15, 23, 42, 0.72) 100%)',
        }}
      />
      <div
        className="sticker-blob__fill"
        aria-hidden
        style={{
          background: frameBg,
          borderRadius: mainR,
          transform: `rotate(${3 - i * 2.5}deg)`,
        }}
      />
      <div className="sticker-blob__icon">
        <StickerIcon size={ICON_PX} weight="fill" color={color} aria-hidden />
      </div>
    </div>
  )
}

/** Scrolling “field” strip — sky, hills, path */
export function StickerTrackIllustration() {
  return (
    <svg
      className="sticker-track-svg"
      viewBox="0 0 800 96"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden
    >
      <defs>
        <linearGradient id="sticker-sky" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1e3a5f" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="sticker-hill" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#15803d" />
          <stop offset="100%" stopColor="#14532d" />
        </linearGradient>
        <linearGradient id="sticker-path" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#86efac" stopOpacity="0.35" />
          <stop offset="50%" stopColor="#bbf7d0" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#86efac" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <rect width="800" height="96" fill="url(#sticker-sky)" />
      <circle cx="620" cy="28" r="18" fill="#fde68a" opacity="0.95" />
      <circle cx="620" cy="28" r="22" fill="#fde68a" opacity="0.2" />
      <ellipse cx="120" cy="22" rx="36" ry="10" fill="#334155" opacity="0.45" />
      <ellipse cx="280" cy="18" rx="28" ry="8" fill="#334155" opacity="0.35" />
      <path
        d="M0 70 Q120 40 240 58 T480 52 T800 48 L800 96 L0 96 Z"
        fill="url(#sticker-hill)"
        stroke="#0f172a"
        strokeWidth="2"
        strokeLinejoin="round"
        opacity="0.95"
      />
      <path
        d="M0 68 Q200 48 400 62 T800 56"
        fill="none"
        stroke="url(#sticker-path)"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.95"
      />
      <g fill="#fef9c3" stroke="#0f172a" strokeWidth="1.2">
        <circle cx="180" cy="54" r="3" />
        <circle cx="196" cy="58" r="2.5" />
        <circle cx="520" cy="50" r="3" />
        <circle cx="536" cy="54" r="2.5" />
      </g>
      <path
        d="M680 62 L688 50 L696 62 Z"
        fill="#64748b"
        stroke="#0f172a"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}
