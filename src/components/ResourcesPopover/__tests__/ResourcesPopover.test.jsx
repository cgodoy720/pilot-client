import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResourcesPopover, { parseLinkedResources } from '../ResourcesPopover';

const GUIDE = {
  url: 'https://docs.google.com/document/d/abc/edit',
  type: 'Google doc',
  title: 'Role Reference Guide',
  description: 'The six roles Builders are assigned to in Cycle 2',
};

describe('parseLinkedResources', () => {
  it('returns [] for null, undefined, empty string, and empty array', () => {
    expect(parseLinkedResources(null)).toEqual([]);
    expect(parseLinkedResources(undefined)).toEqual([]);
    expect(parseLinkedResources('')).toEqual([]);
    expect(parseLinkedResources('   ')).toEqual([]);
    expect(parseLinkedResources([])).toEqual([]);
  });

  it('passes through a well-formed array (jsonb from the API)', () => {
    expect(parseLinkedResources([GUIDE])).toEqual([GUIDE]);
  });

  it('wraps a single object', () => {
    expect(parseLinkedResources(GUIDE)).toEqual([GUIDE]);
  });

  it('parses a JSON string (legacy string rows)', () => {
    expect(parseLinkedResources(JSON.stringify([GUIDE]))).toEqual([GUIDE]);
  });

  it('treats a bare URL string as a single resource', () => {
    expect(parseLinkedResources('https://example.com/doc')).toEqual([
      { url: 'https://example.com/doc', title: 'https://example.com/doc' },
    ]);
  });

  it('drops non-URL junk strings and items without a url', () => {
    expect(parseLinkedResources('just some text')).toEqual([]);
    expect(parseLinkedResources([{ title: 'no url' }, GUIDE, null])).toEqual([GUIDE]);
  });

  it('normalizes string items inside an array', () => {
    expect(parseLinkedResources(['https://example.com'])).toEqual([
      { url: 'https://example.com', title: 'https://example.com' },
    ]);
  });
});

describe('ResourcesPopover', () => {
  it('renders nothing when there are no resources', () => {
    const { container } = render(<ResourcesPopover resources={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the button and opens the resource list on click', async () => {
    const user = userEvent.setup();
    render(<ResourcesPopover resources={[GUIDE]} />);

    const trigger = screen.getByRole('button', { name: /resources/i });
    await user.click(trigger);

    const link = screen.getByRole('link', { name: /role reference guide/i });
    expect(link).toHaveAttribute('href', GUIDE.url);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.getByText(GUIDE.description)).toBeInTheDocument();
  });

  it('shows a count in the label when there is more than one resource', () => {
    render(
      <ResourcesPopover
        resources={[GUIDE, { url: 'https://example.com/template', title: 'Template' }]}
      />
    );
    expect(screen.getByRole('button', { name: /resources · 2/i })).toBeInTheDocument();
  });
});
