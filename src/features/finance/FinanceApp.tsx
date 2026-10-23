import { useEffect, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChartNoAxesCombined,
  ChevronLeft,
  ChevronRight,
  Download,
  LayoutDashboard,
  List,
  Plus,
  Settings2,
  Wallet,
  X,
  Upload,
  CircleHelp,
  CalendarDays,
  Database,
  Check,
  Pencil,
} from "lucide-react";
import {
  defaults,
  initialLedger,
  validateLedger,
  totals,
  result,
  round,
  money,
  percent,
  months,
  exportCSV,
} from "./model";
import type { Entry, Ledger, Settings } from "./model";
const STORAGE = "fluxo-financeiro-v1";
type Tab = "overview" | "ledger" | "year" | "settings";
function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function today() {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Sao_Paulo" }).format(new Date());
}
const zeroEntry = (date: string): Entry => ({
  date,
  revenue: 0,
  spend: 0,
  tax: 0,
  fee: 0,
  other: 0,
  refunds: 0,
  withdrawal: 0,
  orders: null,
  note: "",
});
export function FinanceApp() {
  const [ledger, setLedger] = useState<Ledger>(initialLedger);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState("");
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(9);
  const [tab, setTab] = useState<Tab>("overview");
  const [editing, setEditing] = useState<Entry | null>(null);
  const [originalDate, setOriginalDate] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [help, setHelp] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE);
      if (saved) setLedger(validateLedger(JSON.parse(saved)));
    } catch {
      setStorageError(
        "Não foi possível ler o backup local. Exporte os dados antes de continuar; o armazenamento não será sobrescrito.",
      );
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready || storageError) return;
    try {
      localStorage.setItem(STORAGE, JSON.stringify(ledger));
    } catch {
      setStorageError(
        "O navegador não conseguiu salvar. Exporte um backup JSON para preservar suas alterações.",
      );
    }
  }, [ledger, ready, storageError]);
  const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;
  const annual = tab === "year";
  const selected = ledger.entries
    .filter((e) => e.date.startsWith(annual ? String(year) + "-" : prefix))
    .sort((a, b) => a.date.localeCompare(b.date));
  const t = totals(selected);
  const recorded = selected.length;
  const annualRows = months.map((name, i) => ({
    name: name.slice(0, 3),
    full: name,
    month: i,
    ...totals(
      ledger.entries.filter((e) => e.date.startsWith(`${year}-${String(i + 1).padStart(2, "0")}`)),
    ),
    count: ledger.entries.filter((e) =>
      e.date.startsWith(`${year}-${String(i + 1).padStart(2, "0")}`),
    ).length,
  }));
  let running = 0;
  const chart = annual
    ? annualRows
        .filter((r) => r.count)
        .map((r) => ({
          name: r.name,
          Receita: r.revenue,
          Custos: r.cost,
          Lucro: r.profit,
          Acumulado: 0,
        }))
    : selected.map((e) => {
        running = round(running + result(e).profit);
        return {
          name: e.date.slice(8),
          Receita: e.revenue,
          Custos: result(e).cost,
          Lucro: result(e).profit,
          Acumulado: running,
        };
      });
  const days = new Date(year, month + 1, 0).getDate();
  const target =
    ledger.settings.dailyGoal *
    (annual ? (new Date(year, 1, 29).getMonth() === 1 ? 366 : 365) : days);
  function begin(e?: Entry) {
    setOriginalDate(e?.date ?? null);
    setEditing(e ? { ...e } : zeroEntry(today()));
  }
  function saveEntry(e: Entry) {
    if (ledger.entries.some((x) => x.date === e.date && x.date !== originalDate)) {
      setMessage("Já existe um lançamento nessa data. Edite a linha existente.");
      return;
    }
    try {
      validateLedger({ ...ledger, entries: [e] });
    } catch (err) {
      setMessage((err as Error).message);
      return;
    }
    setLedger((l) => ({ ...l, entries: [...l.entries.filter((x) => x.date !== originalDate), e] }));
    setYear(Number(e.date.slice(0, 4)));
    setMonth(Number(e.date.slice(5, 7)) - 1);
    setEditing(null);
    setMessage("Lançamento salvo neste navegador.");
  }
  async function importBackup(f?: File) {
    if (!f) return;
    try {
      if (f.size > 10_000_000) throw new Error("Arquivo muito grande (máximo 10 MB).");
      const next = validateLedger(JSON.parse(await f.text()));
      if (
        !confirm(
          `Restaurar ${next.entries.length} lançamentos? Isso substituirá os dados locais. Exporte seu backup antes de continuar.`,
        )
      )
        return;
      setStorageError("");
      setLedger(next);
      setMessage("Backup restaurado.");
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      if (file.current) file.current.value = "";
    }
  }
  if (!ready) return <div className="loading">Carregando seu financeiro…</div>;
  return (
    <div className="shell">
      <aside className="sidebar">
        <a className="brand" href="/">
          <span className="brand-icon">
            <ChartNoAxesCombined size={23} />
          </span>
          fluxo<span className="brand-dot">.</span>
        </a>
        <div className="workspace">
          <span className="workspace-icon">BA</span>
          <div>
            <strong>Batidas Artesanais</strong>
            <small>Operação low ticket</small>
          </div>
        </div>
        <span className="nav-caption">SEU FINANCEIRO</span>
        <nav>
          {(
            [
              { id: "overview", icon: LayoutDashboard, label: "Visão geral" },
              { id: "ledger", icon: List, label: "Lançamentos" },
              { id: "year", icon: CalendarDays, label: "Visão anual" },
              { id: "settings", icon: Settings2, label: "Configurações" },
            ] as const
          ).map((n) => (
            <button
              key={n.id}
              className={tab === n.id ? "active" : ""}
              onClick={() => setTab(n.id)}
            >
              <n.icon size={19} />
              {n.label}
              {tab === n.id && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="side-bottom">
          <div className="source-label">
            <Database size={16} /> Origem dos dados
          </div>
          <p>Planilha • entrada manual</p>
          <small>
            UTMify e GG Checkout
            <br />
            ainda não conectados
          </small>
          <button className="help-button" onClick={() => setHelp(true)}>
            <CircleHelp size={16} /> Entender os cálculos
          </button>
          <div className="avatar-row">
            <span className="avatar">BA</span>
            <div>
              <strong>Minha operação</strong>
              <small>Controle financeiro</small>
            </div>
          </div>
        </div>
      </aside>
      <div className="main">
        <header className="topbar">
          <span>
            Minha operação <span className="slash">/</span> <strong>Financeiro</strong>
          </span>
          <span className="local-status">
            <span />
            Dados neste navegador
          </span>
        </header>
        <main className="content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">CLAREZA PARA CRESCER</div>
              <h1>
                {tab === "ledger"
                  ? "Seus lançamentos"
                  : tab === "year"
                    ? "Seu ano, em perspectiva"
                    : tab === "settings"
                      ? "Do seu jeito"
                      : "Cada número, uma decisão."}
              </h1>
              <p>
                {tab === "settings"
                  ? "Defina as premissas e cuide dos seus dados."
                  : "Receitas, custos e resultados da sua operação em um só lugar."}
              </p>
            </div>
            <button className="primary" onClick={() => begin()}>
              <Plus size={18} /> Novo lançamento
            </button>
          </div>
          {storageError && (
            <div role="alert" className="warning">
              {storageError}
            </div>
          )}
          {message && (
            <div role="status" className="notice">
              {message}
              <button aria-label="Fechar aviso" onClick={() => setMessage("")}>
                <X size={16} />
              </button>
            </div>
          )}
          {tab !== "settings" && (
            <>
              <div className="toolbar">
                <div className="period">
                  <CalendarDays size={17} />
                  {!annual && (
                    <select
                      aria-label="Mês"
                      value={month}
                      onChange={(e) => setMonth(Number(e.target.value))}
                    >
                      {months.map((m, i) => (
                        <option key={m} value={i}>
                          {m}
                        </option>
                      ))}
                    </select>
                  )}
                  <select
                    aria-label="Ano"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                  >
                    {Array.from(
                      new Set([
                        2025,
                        2026,
                        2027,
                        2028,
                        year,
                        ...ledger.entries.map((e) => Number(e.date.slice(0, 4))),
                      ]),
                    )
                      .sort()
                      .map((y) => (
                        <option key={y}>{y}</option>
                      ))}
                  </select>
                  <button
                    aria-label="Período anterior"
                    onClick={() => {
                      if (annual) setYear((y) => y - 1);
                      else if (month === 0) {
                        setMonth(11);
                        setYear((y) => y - 1);
                      } else setMonth((m) => m - 1);
                    }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    aria-label="Próximo período"
                    onClick={() => {
                      if (annual) setYear((y) => y + 1);
                      else if (month === 11) {
                        setMonth(0);
                        setYear((y) => y + 1);
                      } else setMonth((m) => m + 1);
                    }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
                <div className="toolbar-right">
                  <span className="muted">{recorded} dias registrados</span>
                  <button
                    className="secondary"
                    onClick={() =>
                      download(
                        `financeiro-${annual ? year : prefix}.csv`,
                        exportCSV(selected),
                        "text/csv;charset=utf-8",
                      )
                    }
                  >
                    <Download size={16} /> Exportar CSV
                  </button>
                </div>
              </div>
              <section className="kpis">
                <Metric
                  title="Faturamento bruto"
                  value={money(t.revenue)}
                  subtitle="Receita informada no período"
                  icon={<ArrowUpRight size={18} />}
                />
                <Metric
                  title="Custo total"
                  value={money(t.cost)}
                  subtitle="Anúncios + impostos + taxas + outros"
                  icon={<ArrowDownLeft size={18} />}
                />
                <Metric
                  title="Lucro operacional"
                  value={money(t.profit)}
                  subtitle={`${percent(t.margin)} de margem sobre receita`}
                  featured
                  positive={t.profit >= 0}
                  icon={<ChartNoAxesCombined size={18} />}
                />
                <Metric
                  title="Saldo após retiradas"
                  value={money(t.balance)}
                  subtitle={`${money(t.withdrawal)} retirados no período`}
                  icon={<Wallet size={18} />}
                />
              </section>
              {recorded === 0 ? (
                <section className="empty">
                  <CalendarDays size={35} />
                  <h2>Um período para começar.</h2>
                  <p>
                    Ainda não há lançamentos aqui. Meses vazios não são tratados como meses de
                    faturamento zero.
                  </p>
                  <button
                    className="primary"
                    onClick={() => {
                      setOriginalDate(null);
                      setEditing(zeroEntry(prefix + "-01"));
                    }}
                  >
                    Adicionar primeiro dia
                  </button>
                </section>
              ) : (
                <>
                  {(tab === "overview" || annual) && (
                    <>
                      <div className="charts">
                        <section className="panel chart-panel">
                          <div className="panel-heading">
                            <div>
                              <h2>O ritmo da operação</h2>
                              <p>
                                {annual
                                  ? "Comparação entre os meses registrados"
                                  : "Faturamento e custos, dia a dia"}
                              </p>
                            </div>
                            <div className="legend">
                              <span className="green-dot" />
                              Receita <span className="gray-dot" />
                              Custos
                            </div>
                          </div>
                          <div className="chart">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart
                                data={chart}
                                margin={{ left: 0, right: 12, top: 15, bottom: 0 }}
                              >
                                <defs>
                                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#139b70" stopOpacity={0.2} />
                                    <stop offset="100%" stopColor="#139b70" stopOpacity={0} />
                                  </linearGradient>
                                </defs>
                                <CartesianGrid
                                  vertical={false}
                                  stroke="#e9eeec"
                                  strokeDasharray="3 4"
                                />
                                <XAxis
                                  dataKey="name"
                                  tickLine={false}
                                  axisLine={false}
                                  tick={{ fontSize: 11, fill: "#84908b" }}
                                />
                                <YAxis
                                  width={52}
                                  tickLine={false}
                                  axisLine={false}
                                  tickFormatter={(v) =>
                                    `${v >= 1000 ? (v / 1000).toFixed(1) + "k" : v}`
                                  }
                                  tick={{ fontSize: 11, fill: "#84908b" }}
                                />
                                <Tooltip
                                  formatter={(v: number) => money(v)}
                                  labelFormatter={(v) => (annual ? v : `Dia ${v}`)}
                                  contentStyle={{ borderRadius: 12, border: "1px solid #e3e8e5" }}
                                />
                                <Area
                                  type="monotone"
                                  dataKey="Receita"
                                  stroke="#139b70"
                                  strokeWidth={2.5}
                                  fill="url(#rev)"
                                />
                                <Area
                                  type="monotone"
                                  dataKey="Custos"
                                  stroke="#a7b2ad"
                                  strokeWidth={2}
                                  fill="transparent"
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </section>
                        <section className="panel goal">
                          <span className="eyebrow">UMA META, UM CAMINHO</span>
                          <h2>Lucro de {annual ? "ano" : "mês"}</h2>
                          <div className="goal-value">{money(t.profit)}</div>
                          <p>de {money(target)} planejados</p>
                          <div className="progress">
                            <span
                              style={{
                                width: `${Math.max(0, Math.min(100, target > 0 ? (t.profit / target) * 100 : 0))}%`,
                              }}
                            />
                          </div>
                          <div className="goal-progress">
                            <strong>
                              {target > 0
                                ? percent((t.profit / target) * 100)
                                : "Meta não definida"}
                            </strong>
                            <span>da meta do período</span>
                          </div>
                          <div className="goal-bottom">
                            <span>
                              Meta diária<strong>{money(ledger.settings.dailyGoal)}</strong>
                            </span>
                            <span>
                              Média registrada
                              <strong className={t.profit >= 0 ? "positive" : "negative"}>
                                {money(t.profit / recorded)}
                              </strong>
                            </span>
                          </div>
                          <button className="text-button" onClick={() => setTab("settings")}>
                            Ajustar minha meta <ArrowUpRight size={15} />
                          </button>
                        </section>
                      </div>
                      <div className="mini-metrics">
                        <div>
                          <span>ROI sobre custo total</span>
                          <strong>{percent(t.roi)}</strong>
                        </div>
                        <div>
                          <span>ROAS de anúncios</span>
                          <strong>{t.roas === null ? "—" : `${t.roas.toFixed(2)}x`}</strong>
                        </div>
                        <div>
                          <span>CPA de anúncios</span>
                          <strong>{t.cpa === null ? "—" : money(t.cpa)}</strong>
                        </div>
                        <div>
                          <span>Ticket médio</span>
                          <strong>{t.ticket === null ? "—" : money(t.ticket)}</strong>
                        </div>
                        <p>
                          {t.orders === null
                            ? "Preencha os pedidos aprovados de todos os dias para calcular CPA e ticket médio."
                            : `${t.orders} pedidos aprovados informados.`}
                        </p>
                      </div>
                    </>
                  )}
                  {annual ? (
                    <section className="panel">
                      <div className="panel-heading">
                        <div>
                          <h2>Os 12 meses da sua operação</h2>
                          <p>Clique em um mês para abrir seus lançamentos.</p>
                        </div>
                      </div>
                      <div className="table-wrap">
                        <table>
                          <thead>
                            <tr>
                              <th>Mês</th>
                              <th>Receita</th>
                              <th>Custos</th>
                              <th>Lucro</th>
                              <th>Margem</th>
                              <th>ROI</th>
                              <th>Dias</th>
                            </tr>
                          </thead>
                          <tbody>
                            {annualRows.map((r) => (
                              <tr key={r.name}>
                                <td>
                                  <button
                                    className="month-link"
                                    onClick={() => {
                                      setMonth(r.month);
                                      setTab("ledger");
                                    }}
                                  >
                                    {r.full}
                                  </button>
                                </td>
                                <td>{r.count ? money(r.revenue) : "—"}</td>
                                <td>{r.count ? money(r.cost) : "—"}</td>
                                <td className={r.profit >= 0 ? "positive" : "negative"}>
                                  {r.count ? money(r.profit) : "—"}
                                </td>
                                <td>{percent(r.margin)}</td>
                                <td>{percent(r.roi)}</td>
                                <td>{r.count || "Sem dados"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  ) : (
                    <section className="panel">
                      <div className="panel-heading">
                        <div>
                          <h2>{tab === "overview" ? "Por trás dos números" : "Planilha do mês"}</h2>
                          <p>
                            {months[month]} de {year} · valores em reais · clique no lápis para
                            editar
                          </p>
                        </div>
                        <span className="badge">{selected.length} lançamentos</span>
                      </div>
                      <div className="table-wrap">
                        <table>
                          <thead>
                            <tr>
                              {[
                                "Dia",
                                "Faturamento",
                                "Anúncios",
                                "Impostos",
                                "Taxas",
                                "Outros",
                                "Reembolsos",
                                "Lucro",
                                "Acumulado",
                                "Retiradas",
                                "Pedidos",
                                "",
                              ].map((x, i) => (
                                <th key={i}>{x}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {(() => {
                              let acc = 0;
                              return selected.map((e) => {
                                const p = result(e).profit;
                                acc = round(acc + p);
                                return (
                                  <tr key={e.date}>
                                    <td>
                                      <strong>{e.date.slice(8)}</strong>
                                      <small className="day-month">
                                        /{String(month + 1).padStart(2, "0")}
                                      </small>
                                    </td>
                                    <td>{money(e.revenue)}</td>
                                    <td>{money(e.spend)}</td>
                                    <td>{money(e.tax)}</td>
                                    <td>{money(e.fee)}</td>
                                    <td>{money(e.other)}</td>
                                    <td>{money(e.refunds)}</td>
                                    <td className={p >= 0 ? "positive" : "negative"}>{money(p)}</td>
                                    <td className={acc >= 0 ? "positive" : "negative"}>
                                      {money(acc)}
                                    </td>
                                    <td>{money(e.withdrawal)}</td>
                                    <td>{e.orders ?? "—"}</td>
                                    <td>
                                      <button
                                        className="edit-button"
                                        aria-label={`Editar dia ${e.date.slice(8)}`}
                                        onClick={() => begin(e)}
                                      >
                                        <Pencil size={14} />
                                      </button>
                                    </td>
                                  </tr>
                                );
                              });
                            })()}
                          </tbody>
                          <tfoot>
                            <tr>
                              <td>Total</td>
                              <td>{money(t.revenue)}</td>
                              <td>{money(t.spend)}</td>
                              <td>{money(t.tax)}</td>
                              <td>{money(t.fee)}</td>
                              <td>{money(t.other)}</td>
                              <td>{money(t.refunds)}</td>
                              <td>{money(t.profit)}</td>
                              <td>{money(t.profit)}</td>
                              <td>{money(t.withdrawal)}</td>
                              <td>{t.orders ?? "—"}</td>
                              <td />
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </section>
                  )}
                  {tab === "overview" && (
                    <section className="panel profit-chart">
                      <div className="panel-heading">
                        <div>
                          <h2>A construção do seu resultado</h2>
                          <p>Lucro operacional por dia, incluindo dias negativos.</p>
                        </div>
                      </div>
                      <div className="chart short">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chart}>
                            <CartesianGrid vertical={false} stroke="#e9eeec" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                            <YAxis width={55} axisLine={false} tickLine={false} />
                            <Tooltip formatter={(v: number) => money(v)} />
                            <ReferenceLine y={0} stroke="#aab6af" />
                            <Bar dataKey="Lucro" fill="#139b70" radius={[3, 3, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </section>
                  )}
                </>
              )}
            </>
          )}
          {tab === "settings" && (
            <div className="settings-grid">
              <SettingsForm
                settings={ledger.settings}
                save={(settings) => {
                  setLedger((l) => ({ ...l, settings }));
                  setMessage(
                    "Configurações salvas. Os lançamentos existentes não foram recalculados.",
                  );
                }}
              />
              <section className="panel settings-panel">
                <h2>Seus dados, com você</h2>
                <p>
                  As alterações ficam apenas neste navegador. Não há login, banco em nuvem ou
                  sincronização entre dispositivos nesta versão. Exporte backups regularmente.
                </p>
                <button
                  className="secondary full"
                  onClick={() =>
                    download(
                      `fluxo-backup-${today()}.json`,
                      JSON.stringify(ledger, null, 2),
                      "application/json",
                    )
                  }
                >
                  <Download size={17} /> Baixar backup completo (JSON)
                </button>
                <button className="secondary full" onClick={() => file.current?.click()}>
                  <Upload size={17} /> Restaurar backup JSON
                </button>
                <input
                  ref={file}
                  hidden
                  type="file"
                  accept=".json,application/json"
                  onChange={(e) => void importBackup(e.target.files?.[0])}
                />
                <hr />
                <h2>Fontes e conferência</h2>
                <p>
                  Dados iniciais: imagem enviada em 23/10/2026, dias 1 a 22, atribuídos a outubro de
                  2026. Campos não informados de pedidos permanecem vazios.
                </p>
                <p>
                  Os impostos e as taxas foram transcritos como exibidos. O lucro é recalculado a
                  partir desses valores, com arredondamento em centavos; pode diferir alguns
                  centavos da planilha original.
                </p>
                <div className="integration">
                  <span>UTMify</span>
                  <span className="badge">Não conectada</span>
                </div>
                <div className="integration">
                  <span>GG Checkout</span>
                  <span className="badge">Não conectado</span>
                </div>
                <p>
                  Atualize os totais pelos lançamentos diários. Integração automática exige backend,
                  autenticação e credenciais guardadas no servidor.
                </p>
              </section>
            </div>
          )}
          <footer>
            fluxo. <span>Seu financeiro, com clareza.</span>
            <button onClick={() => setHelp(true)}>Como calculamos</button>
          </footer>
        </main>
      </div>
      {editing && (
        <EntryModal
          entry={editing}
          settings={ledger.settings}
          existing={originalDate !== null}
          close={() => setEditing(null)}
          save={saveEntry}
          remove={() => {
            if (confirm("Excluir este lançamento?")) {
              setLedger((l) => ({
                ...l,
                entries: l.entries.filter((e) => e.date !== originalDate),
              }));
              setEditing(null);
            }
          }}
        />
      )}
      {help && (
        <div className="modal-backdrop" onClick={() => setHelp(false)}>
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label="Como calculamos"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-title">
              <h2>Transparência em cada cálculo</h2>
              <button aria-label="Fechar" onClick={() => setHelp(false)}>
                <X />
              </button>
            </div>
            <dl className="formulas">
              <dt>Custo total</dt>
              <dd>Anúncios + impostos + taxas + outros custos.</dd>
              <dt>Lucro operacional</dt>
              <dd>Faturamento bruto − reembolsos − custo total.</dd>
              <dt>Saldo após retiradas</dt>
              <dd>Lucro do período − retiradas do período. Não representa saldo bancário.</dd>
              <dt>Margem</dt>
              <dd>Lucro ÷ faturamento bruto × 100.</dd>
              <dt>ROI</dt>
              <dd>Lucro ÷ custo total × 100. Pode ter definição diferente na UTMify.</dd>
              <dt>ROAS</dt>
              <dd>Faturamento bruto ÷ gastos em anúncios.</dd>
              <dt>CPA e ticket médio</dt>
              <dd>
                Anúncios ÷ pedidos aprovados; faturamento bruto ÷ pedidos aprovados. Exigem a
                contagem de pedidos de todos os dias do período.
              </dd>
            </dl>
            <p className="muted">
              Retiradas não reduzem o lucro operacional. Divisões por zero e informações ausentes
              aparecem como “—”.
            </p>
          </section>
        </div>
      )}
    </div>
  );
}
function Metric({
  title,
  value,
  subtitle,
  icon,
  featured = false,
  positive = true,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  featured?: boolean;
  positive?: boolean;
}) {
  return (
    <article className={`metric ${featured ? "featured" : ""} ${!positive ? "loss" : ""}`}>
      <div className="metric-title">
        {title}
        <span>{icon}</span>
      </div>
      <strong>{value}</strong>
      <small>{subtitle}</small>
    </article>
  );
}
function SettingsForm({ settings, save }: { settings: Settings; save: (s: Settings) => void }) {
  const [s, set] = useState(settings);
  return (
    <form
      className="panel settings-panel"
      onSubmit={(e) => {
        e.preventDefault();
        save(s);
      }}
    >
      <h2>Premissas da operação</h2>
      <p>Usadas ao calcular novos lançamentos. Valores históricos permanecem preservados.</p>
      <label>
        Meta de lucro por dia (R$)
        <input
          type="number"
          min="0"
          max="1000000000"
          step="0.01"
          required
          value={s.dailyGoal}
          onChange={(e) => set({ ...s, dailyGoal: Number(e.target.value) })}
        />
      </label>
      <label>
        Imposto / encargo (%)
        <input
          type="number"
          min="0"
          max="100"
          step="0.01"
          required
          value={s.taxRate}
          onChange={(e) => set({ ...s, taxRate: Number(e.target.value) })}
        />
      </label>
      <label>
        Base do imposto
        <select
          value={s.taxBase}
          onChange={(e) => set({ ...s, taxBase: e.target.value as Settings["taxBase"] })}
        >
          <option value="spend">Gastos em anúncios (conforme planilha)</option>
          <option value="revenue">Faturamento bruto</option>
        </select>
      </label>
      <label>
        Taxa de checkout sobre faturamento (%)
        <input
          type="number"
          min="0"
          max="100"
          step="0.01"
          required
          value={s.feeRate}
          onChange={(e) => set({ ...s, feeRate: Number(e.target.value) })}
        />
      </label>
      <button className="primary">
        <Check size={17} />
        Salvar configurações
      </button>
    </form>
  );
}
function EntryModal({
  entry,
  settings,
  existing,
  close,
  save,
  remove,
}: {
  entry: Entry;
  settings: Settings;
  existing: boolean;
  close: () => void;
  save: (e: Entry) => void;
  remove: () => void;
}) {
  const [e, set] = useState(entry);
  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", handle);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handle);
      document.body.style.overflow = prev;
    };
  }, [close]);
  const fields = [
    ["revenue", "Faturamento bruto"],
    ["spend", "Gastos em anúncios"],
    ["tax", "Impostos / encargos"],
    ["fee", "Taxas do checkout"],
    ["other", "Outros custos"],
    ["refunds", "Reembolsos"],
    ["withdrawal", "Retirada de lucro"],
  ] as const;
  return (
    <div className="modal-backdrop">
      <form
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label="Lançamento diário"
        onSubmit={(ev) => {
          ev.preventDefault();
          save(e);
        }}
      >
        <div className="modal-title">
          <div>
            <h2>{existing ? "Editar lançamento" : "Novo lançamento"}</h2>
            <p>Um registro consolidado por dia.</p>
          </div>
          <button type="button" aria-label="Fechar" onClick={close}>
            <X />
          </button>
        </div>
        <div className="form-grid">
          <label>
            Data
            <input
              autoFocus
              type="date"
              required
              value={e.date}
              onChange={(ev) => set({ ...e, date: ev.target.value })}
            />
          </label>
          {fields.map(([key, label]) => (
            <label key={key}>
              {label} (R$)
              <input
                type="number"
                min="0"
                max="1000000000"
                step="0.01"
                required
                value={e[key]}
                onChange={(ev) => set({ ...e, [key]: Number(ev.target.value) })}
              />
            </label>
          ))}
          <label>
            Pedidos aprovados
            <input
              type="number"
              min="0"
              step="1"
              value={e.orders ?? ""}
              placeholder="Não informado"
              onChange={(ev) =>
                set({ ...e, orders: ev.target.value === "" ? null : Number(ev.target.value) })
              }
            />
          </label>
        </div>
        <button
          className="text-button"
          type="button"
          onClick={() =>
            set({
              ...e,
              tax: round(
                ((settings.taxBase === "spend" ? e.spend : e.revenue) * settings.taxRate) / 100,
              ),
              fee: round((e.revenue * settings.feeRate) / 100),
            })
          }
        >
          Calcular impostos ({settings.taxRate}%) e taxas ({settings.feeRate}%)
        </button>
        <small className="muted">
          Imposto sobre {settings.taxBase === "spend" ? "anúncios" : "faturamento"}. Taxas sobre
          faturamento. Confira os valores efetivos antes de salvar.
        </small>
        <label>
          Observações
          <textarea
            rows={2}
            maxLength={2000}
            value={e.note}
            onChange={(ev) => set({ ...e, note: ev.target.value })}
          />
        </label>
        <div className="entry-profit">
          Lucro deste dia{" "}
          <strong className={result(e).profit >= 0 ? "positive" : "negative"}>
            {money(result(e).profit)}
          </strong>
        </div>
        <div className="modal-actions">
          {existing && (
            <button className="danger" type="button" onClick={remove}>
              Excluir
            </button>
          )}
          <button className="secondary" type="button" onClick={close}>
            Cancelar
          </button>
          <button className="primary" type="submit">
            Salvar lançamento
          </button>
        </div>
      </form>
    </div>
  );
}
