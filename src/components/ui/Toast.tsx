"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

// Lightweight toast used across screens for demo feedback.
interface ToastCtx {
  show: (msg: string, icon?: string) => void;
}
const Ctx = createContext<ToastCtx>({ show: () => {} });
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ msg: string; icon?: string; visible: boolean }>({
    msg: "",
    visible: false,
  });
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const show = useCallback((msg: string, icon?: string) => {
    setState({ msg, icon, visible: true });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState((s) => ({ ...s, visible: false })), 2200);
  }, []);

  return (
    <Ctx.Provider value={{ show }}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-none fixed bottom-[108px] left-1/2 z-[200] flex max-w-[90%] -translate-x-1/2 items-center gap-2 rounded-[13px] bg-fg px-5 py-3 text-sm font-semibold text-bg shadow-card transition-all ${
          state.visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
        }`}
      >
        {state.icon && <span>{state.icon}</span>}
        <span>{state.msg}</span>
      </div>
    </Ctx.Provider>
  );
}
