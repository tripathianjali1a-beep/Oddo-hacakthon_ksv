interface LogoProps {
  /** Size of the square mark in px. */
  size?: number;
  /** Show the "LuxRent" wordmark next to the mark. */
  showText?: boolean;
  /** Render the wordmark in white (for dark backgrounds like the footer). */
  light?: boolean;
  className?: string;
}

/**
 * LuxRent brand logo — a gradient monogram tile ("LR" / roof mark) plus wordmark.
 * Pure inline SVG so it stays crisp at any size and needs no external asset.
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
          <linearGradient id="lux-tile" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1E293B" />
            <stop offset="1" stopColor="#0F172A" />
          </linearGradient>
          <linearGradient id="lux-mark" x1="12" y1="9" x2="30" y2="31" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F59E0B" />
            <stop offset="1" stopColor="#D97706" />
          </linearGradient>
        </defs>
        {/* Tile */}
        <rect x="0.5" y="0.5" width="39" height="39" rx="11" fill="url(#lux-tile)" />
        <rect x="0.5" y="0.5" width="39" height="39" rx="11" stroke="#334155" strokeOpacity="0.5" />
        {/* Roof / peak accent */}
        <path d="M20 8L31 17.5H9L20 8Z" fill="url(#lux-mark)" />
        {/* Monogram "L" */}
        <path d="M14 15.5H18.6V27.4H27V31.5H14V15.5Z" fill="#F8FAFC" />
        {/* Amber spark */}
        <circle cx="27.5" cy="14.5" r="2" fill="#F59E0B" />
      </svg>
      {showText && (
        <span className={`font-bold text-xl tracking-tight leading-none ${light ? 'text-white' : 'text-navy'}`}>
          Lux<span className="text-amber">Rent</span>
        </span>
      )}
    </span>
  );
}
