import { personById } from "@/lib/data/sample";

export function Avatar({ personId, size = 38 }: { personId: string; size?: number }) {
  const p = personById(personId);
  return (
    <div
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: p.color,
      }}
      className="grid flex-none place-items-center rounded-full font-display font-bold text-white"
      aria-label={p.name}
    >
      {p.initials}
    </div>
  );
}

export function AvatarStack({ ids, size = 34, max = 4 }: { ids: string[]; size?: number; max?: number }) {
  return (
    <div className="flex">
      {ids.slice(0, max).map((id, i) => (
        <div key={id} style={{ marginLeft: i === 0 ? 0 : -9 }} className="rounded-full ring-2 ring-surface">
          <Avatar personId={id} size={size} />
        </div>
      ))}
    </div>
  );
}
