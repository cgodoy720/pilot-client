import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { globSync } from 'glob';

/**
 * Cache-busting regression tests for ContentPreview and related components.
 *
 * Every GET request (axios.get or fetch with no method/GET method) that hits
 * an API endpoint must include a cache-busting query parameter (`t=${Date.now()}`)
 * so the browser never serves stale data after mutations.
 *
 * If you add a new GET request, add `&t=${Date.now()}` (or `?t=${Date.now()}`
 * when it is the first query param) to the URL.
 */

const ROOT = resolve(__dirname, '../../..');

// Files in the ContentPreview page tree
const CONTENT_PREVIEW_DIR = resolve(ROOT, 'pages/ContentPreview');

// Shared curriculum components that are imported by ContentPreview
const CURRICULUM_COMPONENTS_DIR = resolve(ROOT, 'components/curriculum');

/**
 * Reads all .jsx/.js files in a directory tree and returns their contents
 * paired with their relative path.
 */
function getSourceFiles(dir) {
  const pattern = `${dir}/**/*.{js,jsx}`;
  const files = globSync(pattern, { ignore: ['**/__tests__/**', '**/node_modules/**'] });
  return files.map((filePath) => ({
    path: filePath,
    relativePath: filePath.replace(ROOT + '/', ''),
    content: readFileSync(filePath, 'utf-8'),
  }));
}

/**
 * Extracts GET-request URL template literals from source code.
 *
 * Strategy: find every `fetch(\`...\`` and `axios.get(\`...\``, extract the URL,
 * then check surrounding lines for method: 'POST'|'PUT'|'DELETE' to exclude non-GET.
 */
function extractGetUrls(content, filePath) {
  const results = [];
  const lines = content.split('\n');

  // --- axios.get ---
  const axiosGetRegex = /axios\.get\(\s*`([^`]+)`/g;
  let match;
  while ((match = axiosGetRegex.exec(content)) !== null) {
    const line = content.substring(0, match.index).split('\n').length;
    results.push({ url: match[1], line, file: filePath });
  }

  // --- fetch() calls ---
  // Just match `fetch(` followed by a template literal URL
  const fetchRegex = /fetch\(\s*`([^`]+)`/g;
  while ((match = fetchRegex.exec(content)) !== null) {
    const lineNum = content.substring(0, match.index).split('\n').length;

    // Look at the next ~10 lines after the fetch call for method: 'POST'/'PUT'/'DELETE'
    const surroundingLines = lines.slice(lineNum - 1, lineNum + 10).join('\n');
    if (/method\s*:\s*['"](?:POST|PUT|DELETE|PATCH)['"]/i.test(surroundingLines)) {
      continue;
    }

    results.push({ url: match[1], line: lineNum, file: filePath });
  }

  return results;
}

/**
 * Returns true if the URL template contains a cache-busting parameter.
 * Accepts patterns like:
 *   &t=${Date.now()}
 *   ?t=${Date.now()}
 */
function hasCacheBusting(urlTemplate) {
  return /[?&]t=\$\{Date\.now\(\)\}/.test(urlTemplate);
}

// Collect all source files to scan
const allFiles = [
  ...getSourceFiles(CONTENT_PREVIEW_DIR),
  ...getSourceFiles(CURRICULUM_COMPONENTS_DIR),
];

describe('Cache-busting on GET requests', () => {
  // Build a flat list of every GET request across all files
  const allGetRequests = allFiles.flatMap((file) =>
    extractGetUrls(file.content, file.relativePath)
  );

  it('should find at least 12 GET requests across ContentPreview system (sanity check)', () => {
    expect(allGetRequests.length).toBeGreaterThanOrEqual(12);
  });

  // One test per GET request for clear failure messages
  allGetRequests.forEach(({ url, line, file }) => {
    // Build a short human-readable label from the URL path
    const pathMatch = url.match(/\/api\/[^?&$`]+/);
    const label = pathMatch ? pathMatch[0] : url.substring(0, 60);

    it(`${file}:${line} — GET ${label} should include cache-busting param`, () => {
      expect(
        hasCacheBusting(url),
        `Missing &t=\${Date.now()} on GET request at ${file}:${line}\nURL: ${url}`
      ).toBe(true);
    });
  });
});
