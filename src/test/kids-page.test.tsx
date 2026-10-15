import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';
import { ReferencePage } from '@/components/reference-page';
import { bonuses, checkoutWithAttribution, images, offer, previews, feedbacks } from '@/lib/product';

afterEach(() => window.history.replaceState({}, '', '/'));
describe('Kids sales page', () => {
  it('renders the offer on the server and directs only the Premium purchase to its own checkout', () => {
    const page = document.createElement('div');
    page.innerHTML = renderToStaticMarkup(<ReferencePage />);
    expect(page.querySelector('h1')?.textContent).toContain('+300 Brinquedos');
    const links = [...page.querySelectorAll<HTMLAnchorElement>('a.kids-cta')];
    expect(links.length).toBeGreaterThan(4);
    for (const link of links) expect(link.getAttribute('href')).toBe(link.closest('.premium') ? offer.premiumCheckout : offer.checkout);
    expect(page.querySelectorAll('.bonus-card')).toHaveLength(6);
    expect(new Set(bonuses.map(b => b.color)).size).toBe(6);
  });
  it('uses real local images, with the correct bonus covers and all supplied carousel images', () => {
    expect(previews).toHaveLength(8);
    expect(feedbacks).toHaveLength(5);
    for (const path of Object.values(images)) expect(existsSync(resolve('public', path.slice(1))), path).toBe(true);
    expect(bonuses[0].file).toBe('bonus 6 kids.webp');
    expect(bonuses[5].file).toBe('bonus 1 kids.webp');
  });
  it('preserves attribution parameters without forwarding unrelated query data', () => {
    window.history.replaceState({}, '', '/?utm_source=FB&utm_content=creative%7C42&fbclid=abc&email=private');
    const url = new URL(checkoutWithAttribution(offer.checkout));
    expect(url.searchParams.get('utm_content')).toBe('creative|42');
    expect(url.searchParams.get('fbclid')).toBe('abc');
    expect(url.searchParams.has('email')).toBe(false);
  });
});
