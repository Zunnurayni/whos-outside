"use client";

export function ThemeToggle() {
  const toggle = () => {
    const root = document.documentElement;
    const cur = root.getAttribute("data-theme");
    const sysDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    let next: string;
    if (!cur) next = sysDark ? "light" : "dark";
    else if (cur === "dark") next = "light";
    else next = "dark";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("wo-theme", next);
    } catch {
      /* ignore */
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="grid h-10 w-10 place-items-center rounded-xl bg-surface-2 text-[19px] text-fg-soft transition-transform active:scale-90"
    >
      ◐
    </button>
  );
}
