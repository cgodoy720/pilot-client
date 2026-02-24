const MARKERS = ['[TASK_COMPLETE]', '[TASK COMPLETE]'];
const MAX_MARKER_LEN = Math.max(...MARKERS.map(m => m.length)); // 15
const MARKER_REGEX = /\[TASK(?:_| )COMPLETE\]/gi;

// Check if `text` is a prefix of any marker
function couldBeMarkerPrefix(text) {
  const upper = text.toUpperCase();
  return MARKERS.some(marker => marker.startsWith(upper));
}

export function createStreamBuffer() {
  let held = '';

  return {
    append(chunk) {
      held += chunk;
      // Strip any complete markers
      held = held.replace(MARKER_REGEX, '');
      // Find how much of the tail could be a partial marker prefix
      // Check progressively shorter tails
      let safe = held;
      let tail = '';
      for (let i = Math.min(held.length, MAX_MARKER_LEN); i > 0; i--) {
        const candidate = held.slice(-i);
        if (couldBeMarkerPrefix(candidate)) {
          safe = held.slice(0, -i);
          tail = candidate;
          break;
        }
      }
      held = tail;
      return safe;
    },
    flush() {
      const final = held.replace(MARKER_REGEX, '');
      held = '';
      return final;
    }
  };
}
