import { Check, Circle } from "lucide-react";

type Step = { label: string; done: boolean };

export function OnboardingCard({ steps }: { steps: Step[] }) {
  const done = steps.filter((s) => s.done).length;
  const pct = Math.round((done / steps.length) * 100);

  if (done === steps.length) return null;

  return (
    <div className="bold-panel-soft p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Finish setup</h3>
        <span className="font-mono text-[11px] text-muted-foreground">
          {done}/{steps.length}
        </span>
      </div>
      <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-emerald-glow transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <ul className="mt-3 space-y-2 text-xs">
        {steps.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            {s.done ? (
              <Check className="size-3.5 shrink-0 text-emerald-glow" />
            ) : (
              <Circle className="size-3.5 shrink-0 text-muted-foreground/60" />
            )}
            <span className={s.done ? "text-muted-foreground line-through" : "text-foreground"}>
              {s.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
