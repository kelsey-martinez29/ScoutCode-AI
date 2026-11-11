import { useEffect, useRef, useState } from "react";

export type SaveState = "idle" | "saving" | "saved" | "error";

/** Debounced save. Reports real outcome of the save promise — never fakes success. */
export function useAutosave<T>(value: T, save: (v: T) => Promise<void>, { delay = 900, enabled = true } = {}) {
  const [state, setState] = useState<SaveState>("idle");
  const first = useRef(true);
  const saveRef = useRef(save);
  saveRef.current = save;
  const latest = useRef(value);
  latest.current = value;
  const pending = useRef(false);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (!enabled) return;
    pending.current = true;
    const t = setTimeout(async () => {
      setState("saving");
      try {
        await saveRef.current(latest.current);
        pending.current = false;
        setState("saved");
      } catch {
        setState("error");
      }
    }, delay);
    return () => clearTimeout(t);
  }, [value, delay, enabled]);

  const flush = async () => {
    if (!pending.current) return;
    setState("saving");
    try { await saveRef.current(latest.current); pending.current = false; setState("saved"); }
    catch { setState("error"); throw new Error("save failed"); }
  };
  return { state, flush };
}

export function SaveLabel({ state }: { state: SaveState }) {
  const text = { idle: "", saving: "Saving…", saved: "Saved ✓", error: "Couldn't save — check connection" }[state];
  return <span aria-live="polite" className={state === "error" ? "text-sm font-semibold text-destructive" : "text-sm text-muted-foreground"}>{text}</span>;
}

