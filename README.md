# Fluxo — Financeiro Low Ticket

Painel financeiro em português para Batidas Artesanais. Substitui a antiga página de Brinquedos Kids mantendo o projeto Lovable e o histórico Git.

**Editor já vinculado:** https://lovable.dev/projects/b592a45d-01cb-4654-890d-c6a3e90d745f

Commits em `main` devem sincronizar com o editor conforme a conexão existente. A conexão não foi recriada. Publicar no Lovable é uma ação separada.

## Recursos
- Visão mensal e anual com seleção de ano, 12 meses e gráficos.
- Registro diário editável de faturamento, anúncios, impostos, taxas, outros custos, reembolsos, retiradas e pedidos aprovados.
- Lucro, saldo após retiradas, ROI, ROAS, margem, CPA e ticket médio.
- Meta diária configurável; exportação CSV do período; backup/restauração JSON completa com validação.
- Dados iniciais transcritos da imagem de 23/10/2026, dias 1–22, atribuídos a outubro de 2026. Dias sem informação ficam ausentes; pedidos não informados ficam nulos.

## Persistência e acesso
Esta versão usa localStorage, exclusivamente neste navegador. Não há autenticação nem banco compartilhado. Os dados iniciais são parte do código deste repositório público; alterações feitas no painel ficam no dispositivo, não no Git. Exporte backups para preservá-las. Não armazene credenciais no formulário ou no código.

UTMify e GG Checkout não estão conectadas automaticamente. Os valores precisam ser atualizados pelos lançamentos. Para uma versão privada com sincronização, implementar autenticação, banco com controle por usuário e integrações no servidor; importar vendas por ID único para evitar duplicidade.

## Cálculos
Custo total = anúncios + impostos + taxas + outros custos.
Lucro = faturamento − reembolsos − custo total.
Saldo após retiradas = lucro − retiradas (não representa saldo bancário).
Margem = lucro/faturamento; ROI = lucro/custo total; ROAS = faturamento/anúncios.
CPA = anúncios/pedidos aprovados; ticket médio = faturamento/pedidos aprovados. Exibidos apenas com contagem informada em todos os registros do período e denominador positivo.

Imposto padrão: 13,83% sobre anúncios, inferido da imagem, não orientação tributária. Taxa padrão: 4% sobre faturamento. Configurações alteram apenas o botão de cálculo dos lançamentos, preservando o histórico. Importação preserva impostos e taxas exibidos e usa centavos inteiros no lucro. Diferenças de centavos em relação à planilha decorrem de valores exibidos versus precisão interna da origem.

## Desenvolvimento
```sh
npm install
npm run dev
npm run build
npm test
npx tsc --noEmit
```
