import { describe, it, expect } from 'vitest';
import { resolveDeliverablePanel } from '../DeliverablePanel';

describe('resolveDeliverablePanel — deliverable_type routing', () => {
  it('routes schema-bearing tasks to the structured form (precedence over type)', () => {
    expect(resolveDeliverablePanel({ deliverable_schema: { fields: [] }, deliverable_type: 'link' })).toBe('structured');
  });

  it('routes video to the dedicated Loom form', () => {
    expect(resolveDeliverablePanel({ deliverable_type: 'video' })).toBe('video');
  });

  it('routes image and file to their dedicated panels', () => {
    expect(resolveDeliverablePanel({ deliverable_type: 'image' })).toBe('image');
    expect(resolveDeliverablePanel({ deliverable_type: 'file' })).toBe('file');
  });

  it('does NOT treat text as a submission — text tasks are conversation-only', () => {
    expect(resolveDeliverablePanel({ deliverable_type: 'text' })).toBe('none');
  });

  it('routes all URL-style types to the link panel', () => {
    for (const type of ['link', 'document', 'url', 'presentation']) {
      expect(resolveDeliverablePanel({ deliverable_type: type })).toBe('link');
    }
  });

  it('routes genuinely-unconfigured deliverables to the terminal fallback', () => {
    expect(resolveDeliverablePanel({ deliverable_type: 'none' })).toBe('none');
    expect(resolveDeliverablePanel({ deliverable_type: null })).toBe('none');
    expect(resolveDeliverablePanel({ deliverable_type: undefined })).toBe('none');
    expect(resolveDeliverablePanel({})).toBe('none');
    expect(resolveDeliverablePanel(null)).toBe('none');
    // Unknown/typo'd value must fall back rather than silently show a generic panel.
    expect(resolveDeliverablePanel({ deliverable_type: 'slideshow' })).toBe('none');
    // 'assessment' tasks are routed via assessment_id, not this panel.
    expect(resolveDeliverablePanel({ deliverable_type: 'assessment' })).toBe('none');
  });
});
