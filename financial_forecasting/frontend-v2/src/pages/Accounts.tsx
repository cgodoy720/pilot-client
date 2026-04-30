import { PageHeader } from "@/components/PageHeader";
import { Placeholder } from "@/components/Placeholder";

export function AccountsPage() {
  return (
    <div className="mx-auto max-w-[1320px] px-7 py-6 pb-20">
      <PageHeader title="Accounts" subtitle="Funder organizations" />
      <Placeholder name="Accounts" />
    </div>
  );
}
