import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, Mail, Phone } from "lucide-react";

import { ActivityTimeline } from "@/components/ActivityTimeline";
import { Tag } from "@/components/ui/Tag";
import { fmtDate, initials } from "@/lib/format";
import { useActivities } from "@/services/activities";
import { useContacts } from "@/services/contacts";

export function ContactDetailPage() {
  const { id = "" } = useParams<{ id: string }>();

  const { data: contacts } = useContacts();
  const contact = useMemo(
    () => (contacts ?? []).find((c) => c.Id === id),
    [contacts, id],
  );

  const { data: activities = [] } = useActivities({ contactId: id, limit: 30 });

  if (!contact) {
    return (
      <div className="mx-auto max-w-[1320px] px-7 py-6">
        <BackLink />
        <div className="mt-6 rounded-lg border border-border-strong bg-surface p-10 text-center text-[13px] text-ink-3 shadow-sm">
          Loading contact…
        </div>
      </div>
    );
  }

  const fullName =
    [contact.FirstName, contact.LastName].filter(Boolean).join(" ") ||
    contact.Name ||
    "—";

  return (
    <div className="mx-auto max-w-[1320px] px-7 py-6 pb-20">
      <BackLink />

      {/* Header */}
      <div className="mt-4 flex items-start gap-4">
        <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-full bg-surface-2 text-[14px] font-semibold text-ink-2">
          {initials(fullName === "—" ? "?" : fullName)}
        </div>
        <div className="flex-1">
          <h1 className="text-[24px] font-bold leading-tight tracking-tight">
            {fullName}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[12.5px] text-ink-3">
            {contact.Title ? <span>{contact.Title}</span> : null}
            {contact.Department ? <span>· {contact.Department}</span> : null}
            {contact.AccountId ? (
              <>
                <span>·</span>
                <Link
                  to={`/accounts/${contact.AccountId}`}
                  className="underline-offset-4 hover:underline"
                >
                  {contact.Account?.Name ?? contact.AccountId}
                </Link>
              </>
            ) : null}
            {contact.Owner?.Name ? <span>· Owner: {contact.Owner.Name}</span> : null}
            {contact.Philanthropic_Contact__c || contact.Philanthropy__c ? (
              <Tag variant="accent">Philanthropic</Tag>
            ) : null}
            {contact.Board_Status__c ? <Tag>{contact.Board_Status__c}</Tag> : null}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-[12.5px]">
            {contact.Email ? (
              <a
                href={`mailto:${contact.Email}`}
                className="inline-flex items-center gap-1 text-ink-2 hover:text-accent-ink"
              >
                <Mail size={12} /> {contact.Email}
              </a>
            ) : null}
            {contact.Phone || contact.MobilePhone ? (
              <span className="inline-flex items-center gap-1 text-ink-3">
                <Phone size={12} /> {contact.Phone || contact.MobilePhone}
              </span>
            ) : null}
            {contact.LinkedIn_URL__c ? (
              <a
                href={contact.LinkedIn_URL__c}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-ink-2 hover:text-accent-ink"
              >
                <ExternalLink size={12} /> LinkedIn
              </a>
            ) : null}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
        <Stat
          label="Last activity"
          value={fmtDate(contact.Last_Activity_Date__c ?? contact.LastActivityDate)}
        />
        <Stat
          label="Days since"
          value={
            contact.Days_Since_Last_Activity__c != null
              ? String(contact.Days_Since_Last_Activity__c)
              : "—"
          }
        />
        <Stat label="Lead source" value={contact.LeadSource ?? "—"} />
      </div>

      {/* About */}
      {contact.Description ? (
        <SectionCard title="About">
          <div className="whitespace-pre-wrap px-5 py-4 text-[13px] leading-relaxed text-ink-2">
            {contact.Description}
          </div>
        </SectionCard>
      ) : null}

      {/* Activity timeline */}
      <ActivityTimeline activities={activities} />

      <p className="mt-6 text-[11px] text-ink-4">
        SF Id: <span className="mono">{contact.Id}</span>
      </p>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      to="/contacts"
      className="inline-flex items-center gap-1 text-[12.5px] text-ink-3 hover:text-ink"
    >
      <ArrowLeft size={14} /> Contacts
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border-strong bg-surface px-4 py-3 shadow-sm">
      <div className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-3">
        {label}
      </div>
      <div className="mono mt-1 text-[18px] font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6 overflow-hidden rounded-lg border border-border-strong bg-surface shadow-sm">
      <div className="border-b border-border-strong bg-surface-2 px-5 py-2.5 text-[12px] font-semibold uppercase tracking-wider text-ink-3">
        {title}
      </div>
      {children}
    </section>
  );
}

