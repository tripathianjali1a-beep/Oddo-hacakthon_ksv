interface LogoProps {
  /** Size of the square mark in px. */
  size?: number;
  /** Show the "Rentora" wordmark next to the mark. */
  showText?: boolean;
  /** Render the wordmark in white (for dark backgrounds like the footer). */
  light?: boolean;
  className?: string;
}

/**
 * Rentora brand logo — a navy tile carrying an amber crane-hook "R" motif:
 * the ascender doubles as a lifting mast with a hook dot, nodding to the
 * equipment-rental trade. Pure inline SVG, crisp at any size.
 */
export default function Logo({ size = 34, showText = true, light = false, className = '' }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="rt-tile" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1E293B" />
            <stop offset="1" stopColor="#0F172A" />
          </linearGradient>
          <linearGradient id="rt-mark" x1="10" y1="8" x2="30" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F59E0B" />
            <stop offset="1" stopColor="#D97706" />
          </linearGradient>
        </defs>
        {/* Tile */}
        <rect x="0.5" y="0.5" width="39" height="39" rx="11" fill="url(#rt-tile)" />
        <rect x="0.5" y="0.5" width="39" height="39" rx="11" stroke="#334155" strokeOpacity="0.5" />
        {/* Crane jib: horizontal boom off the R's stem */}
        <path d="M13 9.5H30V13H13V9.5Z" fill="url(#rt-mark)" />
        {/* Hook line + hook dot at the jib's end */}
        <rect x="26.4" y="13" width="2.2" height="6.5" fill="url(#rt-mark)" />
        <circle cx="27.5" cy="22" r="2.4" fill="#F59E0B" />
        {/* "R" stem */}
        <path d="M13 9.5H17.6V31.5H13V9.5Z" fill="#F8FAFC" />
        {/* R bowl + leg */}
        <path d="M17.6 15.5H21.5C24 15.5 25.6 17 25.6 19.2C25.6 21 24.6 22.2 23 22.7L26.2 27.5H22.9L20.1 23H17.6V15.5ZM17.6 17.8V20.8H21.2C22.2 20.8 22.9 20.2 22.9 19.3C22.9 18.4 22.2 17.8 21.2 17.8H17.6Z" fill="#F8FAFC" />
        <path d="M20.5 25.4L23.9 31.5H20.6L17.6 26.2L20.5 25.4Z" fill="#F8FAFC" />
      </svg>
      {showText && (
        <span
          className={`font-semibold text-xl leading-none ${light ? 'text-white' : 'text-navy'}`}
          style={{ fontFamily: 'var(--font-head)', letterSpacing: '-0.01em' }}
        >
          Rent<span className="text-amber">ora</span>
        </span>
      )}
    </span>
  );
}
