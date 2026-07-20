import React from 'react';
import { BookOpen, ExternalLink, FileText, Link2, Presentation, Table2, Video } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover';

/**
 * Normalize a task's linked_resources into an array of { url, title?, type?, description? }.
 * Mirrors the server-side normalization in queries/curriculum.js — the column is jsonb
 * but legacy rows may hold a JSON string or a bare URL string.
 */
export function parseLinkedResources(raw) {
  if (!raw) return [];

  let value = raw;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      value = JSON.parse(trimmed);
    } catch (e) {
      return trimmed.startsWith('http') ? [{ url: trimmed, title: trimmed }] : [];
    }
  }

  const list = Array.isArray(value) ? value : [value];
  return list
    .map((item) => (typeof item === 'string' ? { url: item, title: item } : item))
    .filter((item) => item && typeof item === 'object' && typeof item.url === 'string' && item.url);
}

function resourceIcon(type = '') {
  const t = String(type).toLowerCase();
  if (t.includes('video')) return Video;
  if (t.includes('sheet')) return Table2;
  if (t.includes('slide') || t.includes('presentation')) return Presentation;
  if (t.includes('doc') || t.includes('pdf')) return FileText;
  return Link2;
}

const TRIGGER_STYLES = {
  tray: 'inline-flex items-center gap-1 bg-teal-600 hover:bg-teal-700 text-white text-xs px-3 py-1 h-6 rounded-full font-medium transition-colors',
  completion:
    'inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/40 hover:border-white/60 text-white text-sm font-medium rounded-lg px-3.5 py-2 transition-all font-proxima',
};

/**
 * Pill button + popover listing a task's linked resources.
 * Renders nothing when there are no resources.
 */
function ResourcesPopover({ resources = [], variant = 'tray', disabled = false }) {
  if (!resources.length) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" disabled={disabled} className={TRIGGER_STYLES[variant] || TRIGGER_STYLES.tray}>
          <BookOpen className={variant === 'completion' ? 'w-4 h-4' : 'w-3 h-3'} />
          <span>{resources.length > 1 ? `Resources · ${resources.length}` : 'Resources'}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" align="start" className="w-80 p-2 font-proxima">
        <p className="px-2 pt-1 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
          Task resources
        </p>
        <div className="flex flex-col">
          {resources.map((resource, index) => {
            const Icon = resourceIcon(resource.type);
            return (
              <a
                key={`${resource.url}-${index}`}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 rounded-lg p-2 hover:bg-gray-50 transition-colors"
              >
                <Icon className="w-4 h-4 mt-0.5 shrink-0 text-pursuit-purple" />
                <span className="min-w-0">
                  <span className="flex items-center gap-1 text-sm font-medium text-carbon-black group-hover:text-pursuit-purple">
                    <span className="truncate">{resource.title || resource.url}</span>
                    <ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
                  </span>
                  {resource.description && (
                    <span className="mt-0.5 block text-xs leading-snug text-gray-500">{resource.description}</span>
                  )}
                </span>
              </a>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default ResourcesPopover;
