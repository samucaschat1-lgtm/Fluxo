import type { ReactNode } from "react";
import { guideBonuses, guideFaqs, guideOffer } from "@/lib/toy-guide-copy";
import guide from "@/assets/toy-guide.png";
import rocket from "@/assets/rocket.jpg";
import fishing from "@/assets/fishing.jpg";
import cars from "@/assets/cars.jpg";

function CTA({ children, checkout = false }: { children: ReactNode; checkout?: boolean }) {
  return <a className="tg-cta" href={checkout ? guideOffer.checkout : "#oferta"}>{children}</a>;
}
function Section({ children, cream = false, id }: { children: ReactNode; cream?: boolean; id?: string }) {
  return <section id={id} className={`tg-section${cream ? " tg-cream" : ""}`}><div className="tg-container">{children}</div></section>;
}
export function ToyGuidePage() {
  return <div className="toy-guide-page">
    <div className="tg-announcement">OFERTA VÁLIDA SOMENTE HOJE – {guideOffer.date}</div>
    <main>
      <section className="tg-hero tg-cream"><div className="tg-container">
        <p className="tg-eyebrow">Guia de Brinquedos Caseiros</p>
        <h1><span>+300 Brinquedos criativos</span> feitos<br className="tg-desktop-break" /> com o que você<br className="tg-desktop-break" /> já tem em casa</h1>
        <p className="tg-subtitle">Ideias simples para brincar, aprender<br /> e criar momentos reais com seu filho</p>
        <img className="tg-hero-image" src={guide} alt="Guia de Brinquedos Caseiros" width="1536" height="1024" fetchPriority="high" />
        <p className="tg-access">✅ Acesso imediato <span>•</span> Conteúdo vitalício <span>•</span> Atualizações inclusas</p>
        <CTA>QUERO ACESSAR AGORA</CTA>
        <p className="tg-price-note">R$ 10 · pagamento único</p>
        <p className="tg-intro">👉 Acesso imediato a +100 vídeos de montagem passo a passo e +300 brinquedos documentados em PDF, pensados para estimular criatividade, coordenação motora e consciência ambiental.</p>
      </div></section>

      <Section>
        <div className="tg-narrow tg-copy">
          <h2>Você sente que seus filhos estão cada vez mais <span>vidrados nas telas?</span></h2>
          <p>Já tentou sugerir outras atividades, mas tudo parece caro, difícil ou pouco interessante para eles?</p>
          <p>A casa fica cheia de brinquedos caros esquecidos em poucos dias… e o tempo de qualidade simplesmente escapa.</p>
        </div>
      </Section>
      <Section cream>
        <div className="tg-narrow tg-copy">
          <p>Meu nome é Laura Lemos e um dia percebi que os brinquedos caros não estavam trazendo mais alegria para minha filha do que uma simples caixa de papelão transformada em castelo.</p>
          <p>Desde então, passei a estudar, testar e criar ideias sustentáveis e divertidas para brincar com propósito.</p>
          <p>Assim nasceu o <strong>Guia de Brinquedos Caseiros</strong> – um convite para resgatar o que realmente importa: a conexão entre você e seus filhos.</p>
        </div>
      </Section>
      <Section>
        <div className="tg-narrow tg-copy">
          <p>O Guia de Brinquedos Caseiros é um guia cheio de atividades criativas, sustentáveis e afetivas que você pode começar hoje mesmo com seus filhos.</p>
          <p>São ideias fáceis de aplicar, reutilizando materiais descartáveis, mas que aqui ganham vida nova como brinquedos cheios de valor.</p>
          <p>Com ele, você redescobre a alegria de brincar com seus filhos, fortalece os laços familiares e ainda ensina o valor da sustentabilidade com leveza.</p>
          <p><strong>Tudo com o que você já tem em casa – sem complicação, sem gastos e com muito propósito.</strong></p>
        </div>
        <CTA>QUERO CONSTRUIR BRINQUEDOS COM MEUS FILHOS AGORA!</CTA>
      </Section>
      <Section cream>
        <h2>📽️ VEJA O GUIA DE BRINQUEDOS CASEIROS EM AÇÃO:</h2>
        <div className="tg-examples">
          {[
            { image: fishing, alt: "Brinquedo caseiro de pescaria", title: "O poder das brincadeiras sustentáveis", text: "Descubra como atividades simples transformam o tempo em família." },
            { image: rocket, alt: "Foguete feito com materiais simples", title: "Criações que encantam", text: "Veja exemplos de brinquedos incríveis feitos com materiais que você já tem em casa." },
            { image: cars, alt: "Carrinhos feitos com materiais reutilizados", title: "Resultados emocionantes", text: "Crianças mais criativas, menos tempo de tela e mais memórias felizes." },
          ].map(item => <article className="tg-card" key={item.title}><img src={item.image} alt={item.alt} loading="lazy" width="1024" height="768" /><div><h3>{item.title}</h3><p>{item.text}</p></div></article>)}
        </div>
        <p className="tg-callout">✨ E isso é só o começo: descubra mais de 600 atividades para transformar cada dia em uma nova aventura!</p>
      </Section>
      <Section>
        <h2>O QUE VOCÊ VAI APRENDER</h2>
        <p>Ao acessar o Guia de Brinquedos Caseiros, você terá acesso a:</p>
        <ul className="tg-learning tg-narrow">
          <li><span>✅</span><div>Mais de 100 vídeos passo a passo, mostrando a montagem completa dos brinquedos — do início ao fim, sem cortes confusos e sem improviso</div></li>
          <li><span>✅</span><div>Mais de 300 brinquedos documentados em PDF, com:<ul><li>Medidas exatas</li><li>Lista de materiais simples</li><li>Dicas práticas para facilitar a montagem</li><li>Sugestões de adaptação por idade</li></ul></div></li>
          <li><span>✅</span><div>Atividades pensadas para desenvolver imaginação, coordenação motora e consciência ambiental, enquanto a criança brinca de forma ativa — longe das telas</div></li>
        </ul>
        <p className="tg-callout">✨ Destrave todo o potencial do desenvolvimento do seu filho agora mesmo!</p>
      </Section>
      <Section cream>
        <h2>❓ Perguntas Frequentes (FAQ)</h2>
        <div className="tg-faq tg-narrow">{guideFaqs.map(([question, answer], i) => <details key={question}><summary>{i + 1}. {question}</summary><p>{answer}</p></details>)}</div>
        <CTA>Adquirir Acesso ao Guia</CTA>
      </Section>
      <Section>
        <div className="tg-guarantee" role="img" aria-label="Garantia de 7 dias - Mundo Pequeno Gênio"><span>GARANTIA</span><strong>7</strong><span>DIAS</span></div>
        <h2>✅ Garantia de 7 Dias: Sua Satisfação é 100%</h2>
        <div className="tg-narrow tg-copy">
          <p>Acreditamos tanto no poder do Guia de Brinquedos Caseiros que oferecemos garantia total: se em 7 dias você não sentir que os momentos com seus filhos mudaram para melhor, devolvemos seu dinheiro.</p>
          <p>Você só fica com o guia se ele realmente fizer sentido para a sua família.</p>
        </div>
      </Section>
      <Section cream>
        <h2>ADQUIRINDO O GUIA HOJE, VOCÊ LEVA COMO PRESENTE:</h2>
        <div className="tg-bonuses">{guideBonuses.map((title, i) => <article className="tg-bonus" key={title}>
          <span className="tg-gift" aria-hidden="true">🎁</span><p className="tg-bonus-number">Bônus {i + 1}</p><h3>{title}</h3>
        </article>)}</div>
      </Section>
      <Section id="oferta">
        <h2>OFERTA ESPECIAL DE LANÇAMENTO:</h2>
        <article className="tg-offer">
          <div className="tg-offer-ribbon">Guia completo</div>
          <div className="tg-offer-body">
            <img src={guide} alt="Guia completo de Brinquedos Caseiros" loading="lazy" width="1536" height="1024" />
            <p>De <s>R$99</s> por apenas</p><p className="tg-offer-price">R$10,00!</p>
            <p>Você está economizando <strong>R$89,00</strong>,<br /> ou seja, aproximadamente <strong>90% de desconto</strong> para garantir o<br /> <strong>Guia completo</strong></p>
            <CTA checkout>QUERO ACESSAR O GUIA DE BRINQUEDOS CASEIROS POR APENAS R$ 10</CTA>
            <div className="tg-trust"><span>🔒 Ambiente seguro</span><span>Pix ou cartão</span><span>✅ Acesso imediato</span></div>
          </div>
        </article>
      </Section>
    </main>
    <footer className="tg-footer"><div className="tg-container">
      <h2>Suporte e Atendimento</h2>
      <p>Atendimento de segunda a sexta-feira das 13h às 19h</p>
      <p>Mensagens são respondidas em até 1 dia útil. Conte conosco!</p>
      <a href={`mailto:${guideOffer.support}`}>{guideOffer.support}</a>
    </div></footer>
    <div className="tg-sticky"><div><strong>R$ 10</strong><span>pagamento único</span></div><CTA checkout>Quero acessar agora</CTA></div>
  </div>;
}
