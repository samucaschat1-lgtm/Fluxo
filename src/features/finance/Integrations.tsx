export function Integrations() {
  return (
    <section className="panel settings-panel">
      <h2>UTMify + GG Checkout</h2>
      <p>
        Automação ainda não ativada. Nenhuma venda ou despesa está sendo buscada automaticamente.
      </p>
      <div className="settings-grid">
        <article>
          <h2>GG Checkout · vendas aprovadas</h2>
          <p>
            Usar cada pagamento uma única vez para calcular faturamento e pedidos aprovados,
            incluindo o valor dos bumps no pedido. Vendas pendentes não entram no CPA nem no ticket
            médio.
          </p>
          <span className="badge">Pendente: backend e validação do formato</span>
          <p>
            A documentação pública apresenta versões diferentes para a unidade do valor (reais ou
            centavos) e os eventos de reembolso. Antes de conectar, conferir um exemplo de evento da
            sua conta, sem nome, e-mail, CPF, telefone ou segredo.
          </p>
          <a
            className="text-button"
            href="https://docs.ggcheckout.com/help/vendedor/integracoes/estrutura-do-payload-do-webhook"
            target="_blank"
            rel="noreferrer"
          >
            Consultar documentação GG Checkout ↗
          </a>
        </article>
        <article>
          <h2>UTMify · gastos em anúncios</h2>
          <p>
            Precisamos confirmar na sua conta se existe uma API de leitura dos gastos ou exportação
            de relatório. Uma credencial de envio de vendas não garante acesso à leitura dos
            relatórios.
          </p>
          <span className="badge">Pendente: documentação de leitura / exportação</span>
          <p>
            Não somar vendas da UTMify com vendas do checkout: são duas fontes que podem representar
            o mesmo pedido.
          </p>
        </article>
      </div>
      <hr />
      <h2>O que falta para conectar</h2>
      <ol>
        <li>Backend com banco persistente e login para proteger o financeiro.</li>
        <li>Validar os campos e a unidade monetária de um evento real da GG Checkout.</li>
        <li>Confirmar o acesso de leitura dos gastos da UTMify.</li>
        <li>
          Configurar os segredos no servidor e testar um pedido completo, reenvio e reembolso.
        </li>
      </ol>
      <p>
        Não cole chaves de API neste painel. As edições atuais continuam salvas apenas neste
        navegador.
      </p>
      <h2>Cálculos disponíveis agora</h2>
      <p>
        CPA = gasto em anúncios ÷ pedidos aprovados. Ticket médio = faturamento bruto ÷ pedidos
        aprovados. Informe “Pedidos aprovados” nos lançamentos; o cálculo é automático por dia e no
        período. Sem contagem de pedidos, exibimos “—”, não uma estimativa.
      </p>
    </section>
  );
}
