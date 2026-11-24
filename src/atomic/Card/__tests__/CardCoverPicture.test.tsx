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

const RENDITIONS = { thumbWidth: 960, fullWidth: 2400, sizes: '3.75rem' };

describe('ResponsiveImg with renditions', () => {
  it('renders one img with a width-descriptor srcset and sizes, no picture', () => {
    const html = renderToStaticMarkup(
      <ResponsiveImg image={PICTURE} renditions={RENDITIONS} alt="" loading="lazy" />
    );
    expect(html).toBe(
      '<img alt="" loading="lazy" src="/p-full.webp" srcSet="/p-thumb.webp 960w, /p-full.webp 2400w" sizes="3.75rem"/>'
    );
    expect(html).not.toContain('<picture>');
  });

  it('renders a plain img for a single rendition', () => {
    const html = renderToStaticMarkup(
      <ResponsiveImg
        image={{ fullUrl: '/a.webp' }}
        renditions={RENDITIONS}
        alt=""
        loading="lazy"
      />
    );
    expect(html).toBe('<img src="/a.webp" alt="" loading="lazy"/>');
  });
});

describe('Card picture cover', () => {
  it('uses srcset + sizes on the cover and hover images with coverRenditions', () => {
    const html = renderToStaticMarkup(
      <Card
        title="P"
        cover={PICTURE}
        coverHover={{ fullUrl: '/h-full.webp', thumbUrl: '/h-thumb.webp' }}
        coverRenditions={{ ...RENDITIONS, sizes: '50vw' }}
      />
    );
    expect(html).not.toContain('<picture>');
    expect(html).toContain(
      'srcSet="/p-thumb.webp 960w, /p-full.webp 2400w" sizes="50vw"'
    );
    expect(html).toContain(
      'srcSet="/h-thumb.webp 960w, /h-full.webp 2400w" sizes="50vw"'
    );
  });

  it('keeps a string cover a plain img', () => {
    const html = renderToStaticMarkup(<Card title="P" cover="/x.jpg" />);
    expect(html).toContain('src="/x.jpg"');
    expect(html).not.toContain('<picture>');
  });

  it('paints no cover background by default', () => {
    const html = renderToStaticMarkup(<Card title="P" cover="/x.jpg" />);
    expect(html).toMatch(/class="dndev-card-cover"[^>]*data-background="transparent"/);
  });

  it('applies coverBackground on the cover element', () => {
    const html = renderToStaticMarkup(
      <Card title="P" cover="/x.jpg" coverBackground="accent" />
    );
    expect(html).toMatch(/class="dndev-card-cover"[^>]*data-background="accent"/);
  });
});
