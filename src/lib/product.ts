import imageMap from './kids-images.json';
export const offer = {
  checkout: 'https://ggcheckout.app/products-checkout-v2/checkout/37188bd2-cc3a-43d0-b695-cbd0fc08ba13',
  premiumCheckout: 'https://ggcheckout.app/checkout/v5/42268e97-5e14-4e72-b9de-63a1111c49ca',
  price: '10,00', premiumPrice: '27,90', originalPrice: '47,90', guaranteeDays: 7,
};
export const images = imageMap;
export const previews = Object.entries(images).filter(([name]) => name.startsWith('Imagem')).map(([name, src]) => ({ name, src }));
export const feedbacks = Object.entries(images).filter(([name]) => name.startsWith('WhatsApp')).map(([name, src]) => ({ name, src }));
export const bonuses = [
  { title: '56 atividades educativas', description: 'Novas descobertas para aprender brincando.', file: 'bonus 6 kids.webp', color: '#24679d' },
  { title: '15 atividades lúdicas', description: 'Ideias para variar os momentos em família.', file: 'bonus 5 kids.webp', color: '#08776f' },
  { title: '100 truques de mágica', description: 'Surpresas para despertar a curiosidade.', file: 'bonus 4 kids.webp', color: '#7351a0' },
  { title: '27 mágicas com cartas', description: 'Pequenos desafios e muita diversão.', file: 'bonus 3 kids.webp', color: '#b74c2c' },
  { title: 'Piadas infantis', description: 'Mais risadas entre pais e filhos.', file: 'bonus 2 kids.webp', color: '#af4265' },
  { title: 'Mais de 10 certificados', description: 'Celebre cada criação dos pequenos.', file: 'bonus 1 kids.webp', color: '#397347' },
] as const;
export function checkoutWithAttribution(url: string): string {
  if (typeof window === 'undefined') return url;
  const target = new URL(url);
  new URLSearchParams(window.location.search).forEach((value, key) => {
    if (/^(utm_\w+|fbclid|gclid|src|sck)$/.test(key)) target.searchParams.set(key, value);
  });
  return target.href;
}
