import { describe, it, expect } from 'vitest';
import { createStreamBuffer } from '../streamBufferUtils';

// Feed a string through the buffer one character at a time, mimicking the
// worst-case SSE chunking where a marker is split across many chunks.
function runCharByChar(text) {
  const buf = createStreamBuffer();
  let out = '';
  for (const ch of text) out += buf.append(ch);
  out += buf.flush();
  return out;
}

describe('createStreamBuffer — marker stripping', () => {
  it('passes through plain text unchanged', () => {
    expect(runCharByChar('Hello, how is your project going?')).toBe(
      'Hello, how is your project going?'
    );
  });

  it('strips [TASK_COMPLETE] delivered in one chunk', () => {
    const buf = createStreamBuffer();
    const out = buf.append('Great work! [TASK_COMPLETE]') + buf.flush();
    expect(out).toBe('Great work! ');
  });

  it('strips [OPEN_ASSIGNMENT] delivered in one chunk', () => {
    const buf = createStreamBuffer();
    const out = buf.append('Now submit your work. [OPEN_ASSIGNMENT]') + buf.flush();
    expect(out).toBe('Now submit your work. ');
  });

  it('strips both markers when split character-by-character', () => {
    expect(runCharByChar('Done! [TASK_COMPLETE] [OPEN_ASSIGNMENT]')).toBe('Done!  ');
  });

  it('strips the space-variant markers', () => {
    expect(runCharByChar('a [TASK COMPLETE] b [OPEN ASSIGNMENT] c')).toBe('a  b  c');
  });

  it('does not swallow a bracketed non-marker word', () => {
    expect(runCharByChar('See the [notes] section')).toBe('See the [notes] section');
  });

  it('never emits a partial marker prefix mid-stream', () => {
    const buf = createStreamBuffer();
    // A tail that could be the start of [OPEN_ASSIGNMENT] is held back...
    const emitted = buf.append('Submit here [OPEN_ASS');
    expect(emitted).toBe('Submit here ');
    // ...and once completed, the whole marker is removed.
    const rest = buf.append('IGNMENT] thanks') + buf.flush();
    expect(rest).toBe(' thanks');
  });
});
