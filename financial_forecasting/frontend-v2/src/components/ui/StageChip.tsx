import { bucketForStage, bucketMeta } from "@/lib/stages";
import { cn } from "@/lib/utils";

export function StageChip({
  stage,
  className,
}: {
  stage: string | null | undefined;
  className?: string;
}) {
  const meta = bucketMeta(bucketForStage(stage));
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-px text-[11px] font-medium",
        meta.className,
        className,
      )}
      title={stage ?? ""}
    >
      {meta.label}
    </span>
  );
}
