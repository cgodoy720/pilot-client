import { PageHeader } from "@/components/PageHeader";
import { Placeholder } from "@/components/Placeholder";

export function AwardsPage() {
  return (
    <div className="mx-auto max-w-[1320px] px-7 py-6 pb-20">
      <PageHeader
        title="Awards"
        subtitle="Active grants and post-award management"
      />
      <Placeholder name="Awards" />
    </div>
  );
}
