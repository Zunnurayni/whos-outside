// Who's Outside? wordless logo mark.
// Yellow rounded square → black rounded square → two white eyes.
// Minimal and bold so it reads from a 16px favicon up to the splash.
// `size` sets the box; everything else scales from the 100x100 viewBox.
export function Logo({
  size = 64,
  className,
  rounded = 24,
}: {
  size?: number;
  className?: string;
  rounded?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      role="img"
      aria-label="Who's Outside?"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* yellow plate */}
      <rect width="100" height="100" rx={rounded} fill="#FFD400" />
      {/* black inner square (the "face") */}
      <rect x="24" y="24" width="52" height="52" rx="15" fill="#141210" />
      {/* two eyes */}
      <circle cx="40" cy="50" r="7" fill="#FFFFFF" />
      <circle cx="60" cy="50" r="7" fill="#FFFFFF" />
    </svg>
  );
}
