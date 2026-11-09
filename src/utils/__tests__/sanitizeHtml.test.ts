import { describe, it, expect } from 'vitest';

import { sanitizeHtml } from '../sanitizeHtml';

describe('sanitizeHtml (DOMPurify defaults)', () => {
  it('keeps safe markup and inline styles', () => {
    expect(
      sanitizeHtml('<p>Hi <span style="color:red">there</span></p>')
    ).toBe('<p>Hi <span style="color:red">there</span></p>');
  });

  it('removes scripts, event handlers and javascript: URIs', () => {
    const out = sanitizeHtml(
      '<p onclick="x()">a<script>alert(1)</script><a href="javascript:alert(1)">l</a><img src=x onerror="y()"></p>'
    );
    expect(out).not.toMatch(/script|onclick|onerror|javascript:/i);
    expect(out).toContain('<p>a<a>l</a><img src="x"></p>');
  });

  it('removes iframes and forms, keeps task-list checkboxes', () => {
    expect(
      sanitizeHtml(
        '<iframe src="https://evil"></iframe><form action="https://evil"><button>go</button></form>ok<input type="checkbox" disabled="">'
      )
    ).toBe('<button>go</button>ok<input type="checkbox" disabled="">');
  });
});

describe('sanitizeHtml (allowlist)', () => {
  const options = { allowedTags: ['p', 'a'], allowedAttributes: ['href'] };

  it('keeps only allowed tags and attributes, text of others survives', () => {
    expect(
      sanitizeHtml(
        '<p class="c"><a href="https://ok.example" title="t">l</a><em>e</em></p>',
        options
      )
    ).toBe('<p><a href="https://ok.example">l</a>e</p>');
  });
});
