import { PageHeader } from "@/components/PageHeader";
import { Placeholder } from "@/components/Placeholder";

export function PipelinePage() {
  return (
    <div className="px-7 py-6 pb-20">
      <PageHeader title="Pipeline" subtitle="Open opportunities" />
      <Placeholder name="Pipeline" />
    </div>
  );
}
