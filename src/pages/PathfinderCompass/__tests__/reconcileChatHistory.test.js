import { describe, it, expect } from 'vitest';
import { reconcileChatHistory } from '../PathfinderCompass.jsx';

// Server history rows are shaped { id, role, content } (as returned by
// GET /compass/status → normalizeChatHistory filters to user/assistant turns).
const srv = (id, role, content) => ({ id, role, content });
const local = (role, content, extra = {}) => ({ id: `${Date.now()}-${id()}`, role, content, ...extra });
let _n = 0;
const id = () => ++_n;

describe('reconcileChatHistory', () => {
  it('returns serverEmpty when the server has no history', () => {
    const r = reconcileChatHistory([], [local('user', 'hi')]);
    expect(r.serverEmpty).toBe(true);
    expect(r.reconciled).toBeNull();
  });

  it('treats a null/undefined server history as empty', () => {
    expect(reconcileChatHistory(null, []).serverEmpty).toBe(true);
    expect(reconcileChatHistory(undefined, []).serverEmpty).toBe(true);
  });

  it('hydrates purely from the server when local cache is empty', () => {
    const server = [srv(1, 'user', 'hello'), srv(2, 'assistant', 'hi there')];
    const r = reconcileChatHistory(server, []);
    expect(r.serverEmpty).toBe(false);
    expect(r.reconciled.map((m) => [m.role, m.content])).toEqual([
      ['user', 'hello'],
      ['assistant', 'hi there'],
    ]);
  });

  it('merges local-only tail messages the server is missing (disconnect/device-switch)', () => {
    const server = [srv(1, 'user', 'hello'), srv(2, 'assistant', 'hi there')];
    const localMsgs = [
      local('user', 'hello'), // duplicate of server turn → collapses
      local('assistant', 'hi there'), // duplicate → collapses
      local('user', 'a question that never reached the server'), // local-only → kept
    ];
    const r = reconcileChatHistory(server, localMsgs);
    expect(r.reconciled.map((m) => m.content)).toEqual([
      'hello',
      'hi there',
      'a question that never reached the server',
    ]);
  });

  it('collapses a server/local copy of the same turn despite different id namespaces', () => {
    // server uses srv-<id>, local uses nextId() — dedup must be content-based.
    const server = [srv(7, 'assistant', 'same content')];
    const localMsgs = [local('assistant', 'same content')];
    const r = reconcileChatHistory(server, localMsgs);
    expect(r.reconciled).toHaveLength(1);
  });

  it('does NOT drop two distinct local drafts that share a long prefix (item-2 fix)', () => {
    const prefix = 'x'.repeat(250);
    const server = [srv(1, 'assistant', prefix + ' SERVER')];
    const localMsgs = [
      local('user', prefix + ' DRAFT ONE'),
      local('user', prefix + ' DRAFT TWO'),
    ];
    const r = reconcileChatHistory(server, localMsgs);
    // Old 200-char-prefix dedup would have collapsed all three to one key and
    // dropped both drafts. Full-content dedup keeps both.
    const contents = r.reconciled.map((m) => m.content);
    expect(contents).toContain(prefix + ' DRAFT ONE');
    expect(contents).toContain(prefix + ' DRAFT TWO');
    expect(r.reconciled).toHaveLength(3);
  });

  it('ignores streaming placeholders and empty/invalid local messages', () => {
    const server = [srv(1, 'user', 'hello')];
    const localMsgs = [
      local('assistant', '', { streaming: true }), // streaming placeholder
      local('assistant', '   '), // whitespace-only
      { role: 'system', content: 'nope' }, // non user/assistant role
      null,
      local('user', 'real follow-up'),
    ];
    const r = reconcileChatHistory(server, localMsgs);
    expect(r.reconciled.map((m) => m.content)).toEqual(['hello', 'real follow-up']);
  });

  it('every reconciled message carries a clientKey', () => {
    const server = [srv(1, 'user', 'hello')];
    const r = reconcileChatHistory(server, [local('user', 'b')]);
    expect(r.reconciled.every((m) => typeof m.clientKey === 'string' && m.clientKey.length > 0)).toBe(true);
  });
});
