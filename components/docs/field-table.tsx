import { cn } from "@/lib/utils";

export interface Field {
  field: string;
  type: string;
  required?: boolean;
  note: string;
}

export function FieldTable({ fields, title = "Request body fields" }: { fields: Field[]; title?: string }) {
  return (
    <div className="rounded-xl border border-border overflow-hidden mb-6">
      <div className="px-4 py-3 bg-muted/40 border-b border-border">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">{title}</p>
      </div>
      <div className="divide-y divide-border/50">
        {fields.map((f) => (
          <div key={f.field} className="flex items-start gap-4 px-4 py-3">
            <code className="text-xs font-mono text-foreground/80 shrink-0 w-52 truncate pt-px">{f.field}</code>
            <span className="text-xs text-muted-foreground shrink-0 w-24 pt-px">{f.type}</span>
            <span className={cn("text-xs shrink-0 pt-px", f.required ? "text-amber-500" : "text-muted-foreground/70")}>
              {f.required ? "required" : "optional"}
            </span>
            <span className="text-xs text-muted-foreground pt-px hidden sm:block">{f.note}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
