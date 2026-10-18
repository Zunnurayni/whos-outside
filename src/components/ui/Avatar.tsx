import { personById } from "@/lib/data/sample";

export function Avatar({
  personId,
  size = 38,
  showStatus = false,
  className = "",
}: {
  personId: string;
  size?: number;
  showStatus?: boolean;
  className?: string;
}) {
  const p = personById(personId);
  return (
    <div className={`relative inline-flex flex-none items-center justify-center ${className}`}>
      <div
        style={{
          width: size,
          height: size,
          fontSize: Math.max(11, Math.round(size * 0.38)),
          background: `linear-gradient(135deg, ${p.color}, color-mix(in srgb, ${p.color} 65%, #000))`,
        }}
        className="grid place-items-center rounded-full font-display font-bold text-white shadow-sm ring-1 ring-white/20 transition-transform active:scale-95"
        aria-label={p.name}
      >
        {p.initials}
      </div>
      {showStatus && p.isOutside && (
        <span
          className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-surface bg-good"
          title="Outside right now"
        />
      )}
    </div>
  );
}

export function AvatarStack({
  ids,
  size = 32,
  max = 4,
}: {
  ids: string[];
  size?: number;
  max?: number;
}) {
  const visible = ids.slice(0, max);
  const extra = ids.length - max;

  return (
    <div className="flex items-center">
      {visible.map((id, i) => (
        <div
          key={id}
          style={{ marginLeft: i === 0 ? 0 : -8 }}
          className="rounded-full ring-2 ring-surface"
        >
          <Avatar personId={id} size={size} />
        </div>
      ))}
      {extra > 0 && (
        <div
          style={{
            marginLeft: -8,
            width: size,
            height: size,
            fontSize: Math.max(10, Math.round(size * 0.34)),
          }}
          className="grid place-items-center rounded-full border border-line bg-surface-2 font-display font-bold text-fg-soft ring-2 ring-surface"
        >
          +{extra}
        </div>
      )}
    </div>
  );
}
