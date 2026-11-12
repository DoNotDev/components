// packages/components/src/atomic/Card/__tests__/CardCoverPicture.test.tsx

import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect } from 'vitest';

import { ResponsiveImg, THUMBNAIL_MEDIA } from '../../../utils/responsiveImage';
import Card from '../index';

const PICTURE = { fullUrl: '/p-full.webp', thumbUrl: '/p-thumb.webp' };

describe('ResponsiveImg', () => {
  it('serves the thumbnail to phones and the full image above, without a preload', () => {
    const html = renderToStaticMarkup(<ResponsiveImg image={PICTURE} alt="" />);
    expect(html).toBe(
      `<picture><source media="${THUMBNAIL_MEDIA}" srcSet="/p-thumb.webp"/><img src="/p-full.webp" alt=""/></picture>`
    );
  });

  it('renders a plain img for a single rendition', () => {
    const html = renderToStaticMarkup(
      <ResponsiveImg
        image={{ fullUrl: '/a.webp', thumbUrl: '/a.webp' }}
        alt=""
      />
    );
    expect(html).toContain('<img src="/a.webp" alt=""/>');
    expect(html).not.toContain('<picture>');
  });
});

describe('Card picture cover', () => {
  it('renders the cover and hover pairs as <picture>', () => {
    const html = renderToStaticMarkup(
      <Card
        title="P"
        cover={PICTURE}
        coverHover={{ fullUrl: '/h-full.webp', thumbUrl: '/h-thumb.webp' }}
      />
    );
    expect(html).toContain('srcSet="/p-thumb.webp"');
    expect(html).toContain('src="/p-full.webp"');
    expect(html).toContain('srcSet="/h-thumb.webp"');
    expect(html).toContain('src="/h-full.webp" class="dndev-card-cover-hover"');
  });

  it('keeps a string cover a plain img', () => {
    const html = renderToStaticMarkup(<Card title="P" cover="/x.jpg" />);
    expect(html).toContain('src="/x.jpg"');
    expect(html).not.toContain('<picture>');
  });
});
