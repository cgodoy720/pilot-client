import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { MinusCircle, PlusCircle } from 'lucide-react';

const INVOICE_ACTIVITY = [
  {
    month: 'June 2026',
    type: 'stopped',
    count: 5,
    label: 'Stopped invoicing',
    fellows: [
      'Tamzeed Rahman',
      'Poonam Dass',
      'Zane Ahmed',
      'Destiny Joyner',
      'Edwin Codringon',
    ],
  },
  {
    month: 'July 2026',
    type: 'new',
    count: 3,
    label: 'New invoices',
    tag: 'JPMC Fellows',
    fellows: [
      'Ariel Chen',
      'Kelvin Saldana',
      'Jacob Williams',
    ],
  },
  {
    month: 'August 2026',
    type: 'new',
    count: 3,
    label: 'New invoices',
    fellows: [
      'Daniel Chillemi',
      'Kalila Green',
      'Ethan Davey',
    ],
  },
];

const typeStyles = {
  stopped: {
    icon: MinusCircle,
    iconClass: 'text-red-600',
    countClass: 'text-red-700',
    badgeClass: 'bg-red-50 text-red-800 border-red-200',
    cardBorder: 'border-red-100',
  },
  new: {
    icon: PlusCircle,
    iconClass: 'text-green-600',
    countClass: 'text-green-700',
    badgeClass: 'bg-green-50 text-green-800 border-green-200',
    cardBorder: 'border-green-100',
  },
};

const MonthCard = ({ entry }) => {
  const styles = typeStyles[entry.type];
  const Icon = styles.icon;

  return (
    <Card className={`invoice-activity-timeline__month ${styles.cardBorder}`}>
      <CardHeader className="pb-3">
        <div className="invoice-activity-timeline__month-header flex items-center justify-between gap-2">
          <CardTitle className="text-base font-semibold text-gray-900">
            {entry.month}
          </CardTitle>
          {entry.tag && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
              {entry.tag}
            </Badge>
          )}
        </div>
        <div className="invoice-activity-timeline__summary flex items-center gap-2 mt-1">
          <Icon className={`h-4 w-4 ${styles.iconClass}`} />
          <span className="text-xs uppercase tracking-wide text-gray-500 font-medium">
            {entry.label}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className={`invoice-activity-timeline__count text-4xl font-bold ${styles.countClass}`}>
          {entry.count}
        </div>
        <ul className="invoice-activity-timeline__fellows flex flex-wrap gap-2 mt-4">
          {entry.fellows.map((name) => (
            <li key={name}>
              <Badge variant="outline" className={styles.badgeClass}>
                {name}
              </Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

const InvoiceActivityTimeline = () => (
  <section className="invoice-activity-timeline space-y-4">
    <div>
      <h3 className="invoice-activity-timeline__title text-base font-semibold text-gray-900">
        Invoice Activity
      </h3>
      <p className="invoice-activity-timeline__subtitle text-xs text-gray-500 mt-1">
        Recent bond invoice starts and stops by month
      </p>
    </div>
    <div className="invoice-activity-timeline__grid grid grid-cols-1 md:grid-cols-3 gap-4">
      {INVOICE_ACTIVITY.map((entry) => (
        <MonthCard key={entry.month} entry={entry} />
      ))}
    </div>
  </section>
);

export default InvoiceActivityTimeline;
