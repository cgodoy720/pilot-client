import React from 'react';
import { Box } from '@mui/material';

/**
 * Highlight occurrences of `term` inside `text` with a yellow background.
 * Returns a React node tree suitable for inline rendering.
 *
 * Uses String.split with a capturing group so odd-indexed parts are always
 * the matched substrings — avoids the global-regex lastIndex pitfall.
 */
export function highlightText(text: string, term: string): React.ReactNode {
  if (!text || !term) return text || '';
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  if (parts.length === 1) return text;
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <Box key={i} component="span" sx={{ bgcolor: '#fff59d' }}>
            {part}
          </Box>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        ),
      )}
    </>
  );
}
