const defaultProps: React.SVGProps<SVGSVGElement> = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "24",
  height: "24",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className: "size-4 shrink-0",
  role: "img",
  "aria-hidden": "true",
};

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  strokeWidth?: number;
}

export function ArrowLeftIcon({ className, strokeWidth }: IconProps) {
  return (
    <svg
      {...defaultProps}
      strokeWidth={strokeWidth ?? 2}
      className={`size-4 shrink-0 ${className}`}
    >
      <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  );
}

export function ArrowUpRightIcon({ className, strokeWidth }: IconProps) {
  return (
    <svg
      {...defaultProps}
      strokeWidth={strokeWidth ?? 2}
      className={`size-4 shrink-0 ${className}`}
    >
      <path d="M7 7h10v10" />
      <path d="M7 17 17 7" />
    </svg>
  );
}

export function ClipboardPasteIcon({ className, strokeWidth }: IconProps) {
  return (
    <svg
      {...defaultProps}
      strokeWidth={strokeWidth ?? 2}
      className={`size-4 shrink-0 ${className}`}
    >
      <path d="M15 2H9a1 1 0 0 0-1 1v2c0 .6.4 1 1 1h6c.6 0 1-.4 1-1V3c0-.6-.4-1-1-1Z" />
      <path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2M16 4h2a2 2 0 0 1 2 2v2M11 14h10" />
      <path d="m17 10 4 4-4 4" />
    </svg>
  );
}

export function CornerRounderIcon({ className, strokeWidth }: IconProps) {
  return (
    <svg
      {...defaultProps}
      strokeWidth={strokeWidth ?? 2}
      className={`size-4 shrink-0 ${className}`}
    >
      <path d="M21 11a8 8 0 0 0-8-8" />
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    </svg>
  );
}

export function DownloadIcon({ className, strokeWidth }: IconProps) {
  return (
    <svg
      {...defaultProps}
      strokeWidth={strokeWidth ?? 2}
      className={`size-4 shrink-0 ${className}`}
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}

export function EyeIcon({ className, strokeWidth }: IconProps) {
  return (
    <svg
      {...defaultProps}
      strokeWidth={strokeWidth ?? 2}
      className={`size-4 shrink-0 ${className}`}
    >
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function GitHubIcon({ className, strokeWidth }: IconProps) {
  return (
    <svg
      {...defaultProps}
      strokeWidth={strokeWidth ?? 2}
      className={`size-4 shrink-0 ${className}`}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export function LinkIcon({ className, strokeWidth }: IconProps) {
  return (
    <svg
      {...defaultProps}
      strokeWidth={strokeWidth ?? 2}
      className={`size-4 shrink-0 ${className}`}
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

export function SquareImageIcon({ className, strokeWidth }: IconProps) {
  return (
    <svg
      {...defaultProps}
      strokeWidth={strokeWidth ?? 2}
      className={`size-4 shrink-0 ${className}`}
    >
      <path d="M16 3h5v5" />
      <path d="M17 21h2a2 2 0 0 0 2-2" />
      <path d="M21 12v3" />
      <path d="m21 3-5 5" />
      <path d="M3 7V5a2 2 0 0 1 2-2" />
      <path d="m5 21 4.144-4.144a1.21 1.21 0 0 1 1.712 0L13 19" />
      <path d="M9 3h3" />
      <rect x="3" y="11" width="10" height="10" rx="1" />
    </svg>
  );
}

export function SvgToPngIcon({ className, strokeWidth }: IconProps) {
  return (
    <svg
      {...defaultProps}
      strokeWidth={strokeWidth ?? 2}
      className={`size-4 shrink-0 ${className}`}
    >
      <path d="M4 16a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2" />
      <rect width="14" height="14" x="8" y="8" rx="2" />
      <circle cx="14" cy="14" r="2" />
      <path d="m13.4 22 4.7-3.9c.8-.8 2-.8 2.8 0l1.1 1.1" />
    </svg>
  );
}

export function UploadIcon({ className, strokeWidth }: IconProps) {
  return (
    <svg
      {...defaultProps}
      strokeWidth={strokeWidth ?? 2}
      className={`size-4 shrink-0 ${className}`}
    >
      <path d="M12 13v8" />
      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
      <path d="m8 17 4-4 4 4" />
    </svg>
  );
}

export function WarningIcon({ className, strokeWidth }: IconProps) {
  return (
    <svg
      {...defaultProps}
      strokeWidth={strokeWidth ?? 2}
      className={`size-4 shrink-0 ${className}`}
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}
