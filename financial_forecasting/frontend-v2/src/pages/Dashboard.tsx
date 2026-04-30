import { PageHeader } from "@/components/PageHeader";
import { Placeholder } from "@/components/Placeholder";

export function DashboardPage() {
  return (
    <div className="mx-auto max-w-[1320px] px-7 py-6 pb-20">
      <PageHeader title="Dashboard" subtitle="Overview · Pursuit · Q2 2026" />
      <Placeholder name="Dashboard" />
    </div>
  );
}
