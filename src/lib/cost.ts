// Shared cost math for a plan. One source of truth used by the Create
// preview, the create action (to store the per-head figure), and the plan
// card / detail screens. All amounts are whole Naira.

export type CostMode = "even" | "host_share" | "sponsored" | "byo";

export interface CostInput {
  mode: CostMode;
  totalCost: number; // whole cost (even, host_share)
  hostContribution: number; // naira the host puts in (host_share)
  crewSize: number; // number of paying members (max participants)
  sponsorName?: string | null;
}

export interface CostBreakdown {
  mode: CostMode;
  perPerson: number; // what each crew member pays
  hostPays: number; // what the host covers
  hostPercent: number; // host's share of total, 0 to 100
  total: number;
  // one short line for a crew member: what THEY pay
  memberLine: string;
  // one short line for the host, describing the arrangement
  hostLine: string;
}

function naira(n: number): string {
  return "₦" + Math.round(n).toLocaleString("en-NG");
}

export function computeCost({
  mode,
  totalCost,
  hostContribution,
  crewSize,
  sponsorName,
}: CostInput): CostBreakdown {
  const crew = Math.max(1, crewSize);
  const total = Math.max(0, totalCost || 0);

  if (mode === "byo") {
    return {
      mode,
      perPerson: 0,
      hostPays: 0,
      hostPercent: 0,
      total: 0,
      memberLine: "Free to join. Bring money for your own",
      hostLine: "Free to join, everyone covers their own",
    };
  }

  if (mode === "sponsored") {
    const who = sponsorName?.trim() ? sponsorName.trim() : "the host";
    return {
      mode,
      perPerson: 0,
      hostPays: total,
      hostPercent: 100,
      total,
      memberLine: `Free to join. ${who} is covering it`,
      hostLine: total > 0 ? `You cover it all (${naira(total)})` : "It's on you",
    };
  }

  if (mode === "host_share") {
    const host = Math.min(total, Math.max(0, hostContribution || 0));
    const remainder = Math.max(0, total - host);
    // crew splits the remainder across all crew members
    const perPerson = remainder / crew;
    const pct = total > 0 ? Math.round((host / total) * 100) : 0;
    return {
      mode,
      perPerson,
      hostPays: host,
      hostPercent: pct,
      total,
      memberLine: perPerson > 0 ? `${naira(perPerson)} each` : "Free to join",
      hostLine: `You cover ${naira(host)} (${pct}%), crew splits ${naira(remainder)}`,
    };
  }

  // even
  const perPerson = total / crew;
  return {
    mode: "even",
    perPerson,
    hostPays: 0,
    hostPercent: 0,
    total,
    memberLine: perPerson > 0 ? `${naira(perPerson)} each` : "Free to join",
    hostLine: total > 0 ? `${naira(total)} split ${crew} ways` : "Free to join",
  };
}

export { naira };
