import './kids-theme.css';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { bonuses, checkoutWithAttribution, feedbacks, images, offer, previews } from '@/lib/product';

function CTA({ premium = false, children }: { premium?: boolean; children?: ReactNode }) {
  const url = premium ? offer.premiumCheckout : offer.checkout;
  return <a className="kids-cta" href={url} onClick={event => { event.currentTarget.href = checkoutWithAttribution(url); }}>{children || 'QUERO OS +300 BRINQUEDOS'} <span aria-hidden="true">↗</span></a>;
}
function Photo({ src, alt, hero = false, className = '' }: { src: string; alt: string; hero?: boolean; className?: string }) {
  return <img src={src} alt={alt} className={className} loading={hero ? 'eager' : 'lazy'} fetchPriority={hero ? 'high' : 'auto'} decoding="async" width="960" height="1100" />;
}
function Carousel({ items, label, reviews = false }: { items: { src: string; name: string }[]; label: string; reviews?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry?.isIntersecting ?? false));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  function move(direction: number) {
    const node = ref.current;
    if (!node) return;
    const distance = (node.firstElementChild?.getBoundingClientRect().width || 240) + 14;
    const end = node.scrollLeft >= node.scrollWidth - node.clientWidth - 4;
    node.scrollTo({ left: direction > 0 && end ? 0 : node.scrollLeft + distance * direction, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
  useEffect(() => {
    if (paused || !visible || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => { if (!document.hidden) move(1); }, 4200);
    return () => window.clearInterval(timer);
  }, [paused, visible]);
  return <div className={`kids-carousel ${reviews ? 'reviews' : ''}`} role="region" aria-label={label}>
    <div className="carousel-toolbar"><span>Arraste para explorar</span><div><button onClick={() => move(-1)} aria-label={`Anterior: ${label}`}>←</button><button onClick={() => setPaused(!paused)} aria-label={paused ? 'Reproduzir carrossel' : 'Pausar carrossel'}>{paused ? '▶' : 'Ⅱ'}</button><button onClick={() => move(1)} aria-label={`Próximo: ${label}`}>→</button></div></div>
    <div ref={ref} className="carousel-track" tabIndex={0} onPointerDown={() => setPaused(true)} onFocus={() => setPaused(true)} aria-label={label}>
      {items.map((item, i) => <figure key={item.src}><Photo src={item.src} alt={reviews ? `Experiência compartilhada ${i + 1}` : `Página do projeto criativo ${i + 1}`} /></figure>)}
    </div>
  </div>;
}
const baseBenefits = ['+300 projetos de brinquedos criativos', 'Lista de materiais e passo a passo ilustrado', 'Ideias com papelão, tampinhas e materiais recicláveis', 'PDFs para consultar no celular ou imprimir'];
const faqs = [
  ['Como vou receber o material?', 'Após a aprovação do pagamento, você recebe as instruções de acesso pelo WhatsApp e e-mail informados na compra. O material é digital, em PDF.'],
  ['Preciso comprar materiais caros?', 'Os projetos usam materiais simples, como papelão, rolos de papel, garrafas PET e tampinhas. Confira a lista de cada atividade antes de começar.'],
  ['Qual a diferença entre os planos?', 'O Básico inclui o material principal com mais de 300 projetos. O Premium inclui o mesmo material e os seis bônus apresentados nesta página.'],
  ['Para qual idade é indicado?', 'Escolha as atividades conforme a idade, as habilidades e o interesse da criança. Um adulto deve acompanhar as atividades, especialmente cortes, colagens e o uso de peças pequenas.'],
  ['Preciso imprimir tudo?', 'Não. Você pode consultar os PDFs no celular, tablet ou computador e imprimir apenas as páginas que quiser usar.'],
  ['Como funciona a garantia?', 'Você tem 7 dias após a compra para conhecer o material. Se não atender às suas expectativas, solicite o reembolso pelo suporte indicado na confirmação da compra.'],
];
export function ReferencePage() {
  return <div className="kids-page">
    <div className="announcement">✨ Criatividade em família · Material 100% digital</div>
    <header className="kids-header"><a href="#inicio" className="brand">brinquedos<span>kids<span aria-hidden="true">✦</span></span></a><a href="#planos">Conhecer os planos <span aria-hidden="true">↗</span></a></header>
    <main id="inicio">
      <section className="hero section-wrap">
        <div className="hero-copy"><span className="eyebrow">MENOS TELAS. MAIS DESCOBERTAS.</span><h1><span>+300 Brinquedos criativos</span> feitos com o que você já tem em casa</h1><p>Transforme materiais simples em brincadeiras, aprendizado e momentos reais com seu filho.</p><div className="hero-chips"><span>✂ Passo a passo ilustrado</span><span>▤ Pronto para imprimir</span></div><CTA>QUERO COMEÇAR POR R$10</CTA><small>Pagamento único · Acesso após a aprovação · 7 dias de garantia</small></div>
        <div className="hero-art"><span className="art-label">Uma caixa de ideias<br /><b>para criar juntos!</b></span><Photo hero src={images['Kit Educativo Infantil em Destaque.png']} alt="Kit Brinquedos Kids com guia de mais de 300 brinquedos e materiais extras"/><span className="art-note">Papelão + imaginação = diversão ✨</span></div>
      </section>
      <div className="trust-strip section-wrap"><span>📱 Acesso pelo celular</span><span>🖨️ Arquivos em PDF</span><span>♻️ Materiais do dia a dia</span><span>🛡️ Garantia de 7 dias</span></div>
      <section className="section-wrap compact"><div className="section-heading"><span className="eyebrow">DÊ UMA OLHADA POR DENTRO</span><h2>Ideias que saem do papel<br />e viram <em>brincadeira de verdade.</em></h2><p>Veja exemplos das páginas com materiais e instruções de montagem.</p></div><Carousel items={previews.slice(0,4)} label="Primeiras páginas do material"/><Carousel items={previews.slice(4)} label="Mais projetos do material"/><div className="center-cta"><CTA/><small>Escolha uma ideia. Separe os materiais. Criem juntos.</small></div></section>
      <section className="section-wrap compact"><div className="colored-panel teal"><div className="section-heading"><span className="eyebrow">SIMPLES PARA VOCÊ. DIVERTIDO PARA A CRIANÇA.</span><h2>Uma nova forma de aproveitar<br />o tempo juntos.</h2></div><div className="benefit-grid">{[['🎨','Criar com liberdade','Estimule a imaginação com novas cores, formas e possibilidades.'],['🧩','Aprender brincando','Explore a coordenação, a concentração e a resolução de desafios.'],['♻️','Reaproveitar materiais','Dê um novo destino às caixas, tampinhas e rolinhos de papel.'],['💛','Compartilhar momentos','Participe de cada descoberta e celebre as criações em família.']].map(([icon,title,text])=><article key={title}><span className="benefit-icon">{icon}</span><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>
      <section className="section-wrap compact"><div className="how-panel"><Photo src={images['crianca sorribndo preta.webp']} alt="Criança com fantasia criativa de robô de papelão"/><div><span className="eyebrow">DA IDEIA À DIVERSÃO EM 3 PASSOS</span><h2>Você não precisa<br />começar do zero.</h2><ol><li><b>01</b><div><h3>Receba seu material</h3><p>Acesse os PDFs após a confirmação do pagamento.</p></div></li><li><b>02</b><div><h3>Escolha um projeto</h3><p>Confira a lista e separe os materiais com a criança.</p></div></li><li><b>03</b><div><h3>Montem e brinquem juntos</h3><p>Acompanhe o passo a passo pelo celular ou no papel.</p></div></li></ol><CTA>QUERO ACESSAR O MATERIAL</CTA></div></div></section>
      <section className="section-wrap compact"><div className="section-heading"><span className="eyebrow">UM KIT PARA IR ALÉM</span><h2>No Premium, a diversão<br />ganha <em>6 bônus extras.</em></h2><p>Mais atividades para variar as descobertas. Inclusos no Plano Premium.</p></div><div className="bonus-grid">{bonuses.map((bonus,i)=><article className="bonus-card" key={bonus.file} style={{backgroundColor:bonus.color}}><span className="bonus-label">PRESENTE {String(i+1).padStart(2,'0')}</span><h3>{bonus.title}</h3><Photo src={images[bonus.file]} alt={`Capa de ${bonus.title}`}/><p>{bonus.description}</p></article>)}</div></section>
      <section className="section-wrap compact" id="planos"><div className="section-heading"><span className="eyebrow">ESCOLHA SEU KIT</span><h2>A próxima brincadeira<br /><em>começa aqui.</em></h2><p>Pagamento único. Escolha o conteúdo que combina com sua família.</p></div><div className="plans">{[false,true].map(premium=><article className={`plan ${premium?'premium':'basic'}`} id={premium?'plano-completo':'plano-basico'} key={String(premium)}><div className="plan-topline">{premium?'✦ KIT COMPLETO + 6 BÔNUS':'✂ PARA COMEÇAR A CRIAR'}</div><h3>Plano {premium?'Premium':'Básico'}</h3><p>{premium?'Mais possibilidades em um só kit.':'O essencial para começar a diversão.'}</p><Photo src={images[premium?'Kit Educativo Infantil em Destaque.png':'Guia de Brinquedos Caseiros Criativos (1).png']} alt={`Conteúdo do Plano ${premium?'Premium':'Básico'}`}/><ul>{baseBenefits.map(text=><li key={text}>✓ <span>{text}</span></li>)}{premium?bonuses.map(b=><li key={b.file}>🎁 <span>{b.title}</span></li>):<li className="plan-note">Os seis bônus são exclusivos do Premium.</li>}</ul><div className="plan-bottom"><span className="price-label">Seu kit por apenas</span><div className="price"><span>R$</span>{premium?offer.premiumPrice:offer.price}</div><p>Pagamento único · Sem mensalidade</p><CTA premium={premium}>{premium?'QUERO O KIT PREMIUM':'QUERO O BÁSICO POR R$10'}</CTA><small>🔒 Checkout seguro · 🛡️ 7 dias de garantia</small></div></article>)}</div></section>
      <section className="section-wrap compact"><div className="section-heading"><span className="eyebrow">MOMENTOS COMPARTILHADOS</span><h2>Veja as experiências<br />com o material.</h2></div><Carousel items={feedbacks} label="Avaliações compartilhadas" reviews/></section>
      <section className="section-wrap compact"><div className="guarantee colored-panel"><Photo src={images['7 dias de garantia .webp']} alt="Garantia de 7 dias"/><div><span className="eyebrow">CONHEÇA COM TRANQUILIDADE</span><h2>7 dias para descobrir<br />novas possibilidades.</h2><p>Acesse os PDFs e conheça os projetos. Se o material não atender às suas expectativas, solicite o reembolso em até 7 dias após a compra.</p></div></div></section>
      <section className="section-wrap compact faq"><div className="section-heading"><span className="eyebrow">AINDA TEM ALGUMA DÚVIDA?</span><h2>A gente explica.</h2></div>{faqs.map(([q,a])=><details key={q}><summary>{q}<span aria-hidden="true">+</span></summary><p>{a}</p></details>)}<div className="center-cta"><CTA>SIM, QUERO COMEÇAR A CRIAR!</CTA><small>+300 ideias para transformar o que você já tem em casa.</small></div></section>
    </main><footer><div className="section-wrap"><a href="#inicio" className="brand">brinquedos<span>kids✦</span></a><p>Pequenos materiais. Grandes descobertas.</p><p>Copyright © 2026 | Brinquedos Kids · Todos os direitos reservados.</p><small>Este site não é afiliado ao Facebook™, Instagram™, Google™ ou qualquer outra plataforma mencionada. Todos os direitos sobre a obra “Brinquedos Kids” são reservados ao produtor, nos termos da Lei nº 9.610/98.<br/><br/>Material digital educativo. As atividades devem ser realizadas com supervisão de um adulto, especialmente ao usar tesouras, peças pequenas ou outros materiais que exijam cuidado. Os resultados variam conforme a idade, o interesse e o acompanhamento da criança.</small></div></footer>
  </div>;
}
