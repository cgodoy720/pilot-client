import { PageHeader } from "@/components/PageHeader";
import { Placeholder } from "@/components/Placeholder";

export function TasksPage() {
  return (
    <div className="mx-auto max-w-[1320px] px-7 py-6 pb-20">
      <PageHeader
        title="Tasks"
        subtitle="Across accounts, opportunities, awards, and projects"
      />
      <Placeholder name="Tasks" />
    </div>
  );
}
