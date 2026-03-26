import { createIcon } from './Icon'

/* ── Navigation Icons ── */

export const IconKanban = createIcon(
  <>
    <rect x="1" y="1" width="4" height="14" rx="1" />
    <rect x="6" y="1" width="4" height="10" rx="1" />
    <rect x="11" y="1" width="4" height="6" rx="1" />
  </>,
  'IconKanban'
)

export const IconPlus = createIcon(
  <>
    <path d="M8 3v10M3 8h10" />
    <rect x="1" y="1" width="14" height="14" rx="2" />
  </>,
  'IconPlus'
)

export const IconStar = createIcon(
  <polygon points="8,1 10,6 15,6 11,9.5 12.5,15 8,11.5 3.5,15 5,9.5 1,6 6,6" />,
  'IconStar'
)

export const IconChart = createIcon(
  <>
    <rect x="1" y="8" width="3" height="7" rx="0.5" />
    <rect x="5.5" y="4" width="3" height="11" rx="0.5" />
    <rect x="10" y="1" width="3" height="14" rx="0.5" />
  </>,
  'IconChart'
)

export const IconCard = createIcon(
  <>
    <rect x="1" y="3" width="14" height="10" rx="2" />
    <path d="M1 6h14" />
  </>,
  'IconCard'
)

export const IconDoc = createIcon(
  <>
    <path d="M2 2h12v12H2z" />
    <path d="M5 6h6M5 8h6M5 10h3" />
  </>,
  'IconDoc'
)

export const IconSliders = createIcon(
  <>
    <path d="M1 4h14M1 8h14M1 12h14" />
    <circle cx="5" cy="4" r="1.5" fill="currentColor" />
    <circle cx="11" cy="8" r="1.5" fill="currentColor" />
    <circle cx="7" cy="12" r="1.5" fill="currentColor" />
  </>,
  'IconSliders'
)

export const IconSettings = createIcon(
  <>
    <circle cx="8" cy="8" r="3" />
    <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.5 1.5M11.5 11.5L13 13M13 3l-1.5 1.5M4.5 11.5L3 13" />
  </>,
  'IconSettings'
)

/* ── Navigation Icons (new) ── */

export const IconFileText = createIcon(
  <>
    <rect x="2" y="1" width="12" height="14" rx="1.5" />
    <path d="M5 5h6M5 8h6M5 11h3" />
  </>,
  'IconFileText'
)

export const IconDollar = createIcon(
  <>
    <circle cx="8" cy="8" r="7" />
    <path d="M8 3.5v9M5.5 6c0-1 1-1.5 2.5-1.5s2.5.5 2.5 1.5-1 1.5-2.5 2-2.5 1-2.5 2 1 1.5 2.5 1.5 2.5-.5 2.5-1.5" />
  </>,
  'IconDollar'
)

export const IconUser = createIcon(
  <>
    <circle cx="8" cy="5" r="3" />
    <path d="M2 14c0-3 2.5-5 6-5s6 2 6 5" />
  </>,
  'IconUser'
)

export const IconStop = createIcon(
  <>
    <circle cx="8" cy="8" r="7" />
    <path d="M5 5l6 6M11 5l-6 6" />
  </>,
  'IconStop'
)

/* ── UI Icons ── */

export const IconChevronDown = createIcon(
  <path d="M4 6l4 4 4-4" />,
  'IconChevronDown'
)

export const IconClose = createIcon(
  <>
    <path d="M4 4l8 8M12 4l-8 8" />
  </>,
  'IconClose'
)

export const IconCheck = createIcon(
  <path d="M3 8l3.5 3.5L13 5" />,
  'IconCheck'
)

export const IconSearch = createIcon(
  <>
    <circle cx="7" cy="7" r="4" />
    <path d="M10 10l3 3" />
  </>,
  'IconSearch'
)

export const IconClock = createIcon(
  <>
    <circle cx="8" cy="8" r="7" />
    <path d="M8 4v4l2.5 1.5" />
  </>,
  'IconClock'
)

export const IconNote = createIcon(
  <>
    <rect x="2" y="1" width="12" height="14" rx="1.5" />
    <path d="M5 5h6M5 8h4" />
    <circle cx="11" cy="12" r="2" fill="currentColor" />
  </>,
  'IconNote'
)

export const IconClipboardCheck = createIcon(
  <>
    <rect x="3" y="1" width="10" height="14" rx="1.5" />
    <path d="M6 0.5h4v2H6z" />
    <path d="M6 8l2 2 3-3.5" />
  </>,
  'IconClipboardCheck'
)

export const IconUsers = createIcon(
  <>
    <circle cx="6" cy="5" r="2.5" />
    <path d="M1.5 14.5c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5" />
    <circle cx="11.5" cy="4.5" r="2" />
    <path d="M14.5 14.5c0-2 -1.5-3.5-3-3.5" />
  </>,
  'IconUsers'
)
