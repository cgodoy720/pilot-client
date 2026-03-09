import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Sidebar refresh regression tests for ContentPreview.
 *
 * Every mutation handler in ContentPreview.jsx that changes data visible
 * in the sidebar (days, day metadata, cohort day counts) must call
 * `setSidebarRefreshKey` so the CohortDaySelector re-fetches.
 *
 * If you add a new mutation handler that affects sidebar data, ensure it
 * includes: setSidebarRefreshKey(prev => prev + 1)
 */

const FILE_PATH = resolve(__dirname, '../ContentPreview.jsx');
const content = readFileSync(FILE_PATH, 'utf-8');

/**
 * Extracts the full body of a named handler function.
 * Matches `const handlerName = async (...) => {` or `async function handlerName(`.
 * Returns the source text from opening `{` to its matching closing `}`.
 */
function extractHandlerBody(handlerName) {
  // Match both arrow functions and regular functions
  const patterns = [
    new RegExp(`const\\s+${handlerName}\\s*=\\s*(?:async\\s*)?\\([^)]*\\)\\s*=>\\s*\\{`),
    new RegExp(`(?:async\\s+)?function\\s+${handlerName}\\s*\\([^)]*\\)\\s*\\{`),
  ];

  let startIdx = -1;
  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      startIdx = content.indexOf('{', match.index + match[0].length - 1);
      break;
    }
  }

  if (startIdx === -1) return null;

  // Walk forward counting braces to find the matching close
  let depth = 1;
  let i = startIdx + 1;
  while (i < content.length && depth > 0) {
    if (content[i] === '{') depth++;
    if (content[i] === '}') depth--;
    i++;
  }

  const line = content.substring(0, startIdx).split('\n').length;
  return { body: content.substring(startIdx, i), line };
}

/**
 * Handlers that mutate server state AND affect sidebar-visible data
 * (day list, day metadata, cohort day counts).
 *
 * Each entry: [handlerName, description of why sidebar refresh is needed]
 */
const HANDLERS_REQUIRING_SIDEBAR_REFRESH = [
  ['confirmDeleteDay', 'Deleting a day removes it from sidebar and changes cohort day count'],
  ['confirmDeleteTask', 'Deleting a task may affect sidebar if task counts are shown'],
  ['handleMoveTask', 'Moving a task between days affects both source and target day data'],
  ['handleCreateTask', 'Creating a task may affect sidebar if task counts are shown'],
  ['handleSaveGoals', 'Editing day goals/date changes sidebar day metadata'],
  ['handleUploadComplete', 'Uploading curriculum adds/updates days in sidebar'],
];

/**
 * Handlers that mutate server state but do NOT affect sidebar data.
 * These are excluded from the sidebar refresh requirement.
 *
 * Each entry: [handlerName, reason it's excluded]
 */
const HANDLERS_EXCLUDED = [
  ['handleSaveTask', 'Edits task content only — sidebar shows days, not task details'],
  ['handleRevertField', 'Reverts a field value — sidebar does not show field-level data'],
  ['handleClearTestData', 'Clears preview data and navigates away — no sidebar needed'],
];

describe('Sidebar refresh after mutations in ContentPreview.jsx', () => {
  // Verify every required handler exists and calls setSidebarRefreshKey
  HANDLERS_REQUIRING_SIDEBAR_REFRESH.forEach(([handler, reason]) => {
    it(`${handler} should call setSidebarRefreshKey — ${reason}`, () => {
      const result = extractHandlerBody(handler);
      expect(result, `Handler "${handler}" not found in ContentPreview.jsx`).not.toBeNull();
      expect(
        result.body.includes('setSidebarRefreshKey'),
        `${handler} (line ${result.line}) does not call setSidebarRefreshKey.\nReason it's needed: ${reason}`
      ).toBe(true);
    });
  });

  // Verify excluded handlers exist but are NOT required to have sidebar refresh
  HANDLERS_EXCLUDED.forEach(([handler, reason]) => {
    it(`${handler} is excluded from sidebar refresh requirement — ${reason}`, () => {
      const result = extractHandlerBody(handler);
      expect(result, `Handler "${handler}" not found in ContentPreview.jsx`).not.toBeNull();
      // This test just documents the exclusion — no assertion on setSidebarRefreshKey
    });
  });

  // Catch any NEW mutation handlers that someone adds without updating this test
  it('should account for all mutation handlers (no untracked handlers)', () => {
    const allMutationRegex = /axios\.(delete|post|put)\(\s*`[^`]*\/api\//g;
    const tracked = [
      ...HANDLERS_REQUIRING_SIDEBAR_REFRESH.map(([h]) => h),
      ...HANDLERS_EXCLUDED.map(([h]) => h),
    ];

    // Match only async function declarations (all mutation handlers are async)
    const funcDeclRegex = /const\s+(\w+)\s*=\s*async\s*\(/g;

    let match;
    const untrackedHandlers = new Set();

    while ((match = allMutationRegex.exec(content)) !== null) {
      const before = content.substring(0, match.index);
      const funcMatches = [...before.matchAll(funcDeclRegex)];
      if (funcMatches.length > 0) {
        const name = funcMatches[funcMatches.length - 1][1];
        if (!tracked.includes(name)) {
          untrackedHandlers.add(name);
        }
      }
    }

    expect(
      untrackedHandlers.size,
      `Found untracked mutation handler(s): ${[...untrackedHandlers].join(', ')}.\n` +
      `Add them to either HANDLERS_REQUIRING_SIDEBAR_REFRESH or HANDLERS_EXCLUDED in this test.`
    ).toBe(0);
  });
});
