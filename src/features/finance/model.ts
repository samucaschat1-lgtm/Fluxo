export type Entry = {
  date: string;
  revenue: number;
  spend: number;
  tax: number;
  fee: number;
  other: number;
  refunds: number;
  withdrawal: number;
  orders: number | null;
  note: string;
};
export type Settings = {
  taxRate: number;
  feeRate: number;
  taxBase: "spend" | "revenue";
  dailyGoal: number;
};
export type Ledger = { version: 1; entries: Entry[]; settings: Settings };
export const defaults: Settings = { taxRate: 13.83, feeRate: 4, taxBase: "spend", dailyGoal: 200 };
export const cents = (n: number) => Math.round((n + Number.EPSILON) * 100);
export const round = (n: number) => cents(n) / 100;
export const money = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const percent = (n: number | null) =>
  n === null ? "—" : `${n.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
export function result(e: Entry) {
  const cost = cents(e.spend) + cents(e.tax) + cents(e.fee) + cents(e.other);
  const net = cents(e.revenue) - cents(e.refunds);
  return {
    cost: cost / 100,
    profit: (net - cost) / 100,
    netRevenue: (net - cents(e.tax) - cents(e.fee)) / 100,
  };
}
export function totals(entries: Entry[]) {
  const sum = (key: keyof Entry) =>
    entries.reduce((s, e) => s + cents(Number(e[key] ?? 0)), 0) / 100;
  const revenue = sum("revenue"),
    spend = sum("spend"),
    tax = sum("tax"),
    fee = sum("fee"),
    other = sum("other"),
    refunds = sum("refunds"),
    withdrawal = sum("withdrawal");
  const cost = round(spend + tax + fee + other),
    profit = round(revenue - refunds - cost);
  const ordersKnown = entries.length > 0 && entries.every((e) => e.orders !== null);
  const orders = ordersKnown ? entries.reduce((s, e) => s + (e.orders ?? 0), 0) : null;
  return {
    revenue,
    spend,
    tax,
    fee,
    other,
    refunds,
    withdrawal,
    cost,
    profit,
    balance: round(profit - withdrawal),
    margin: revenue > 0 ? (profit / revenue) * 100 : null,
    roi: cost > 0 ? (profit / cost) * 100 : null,
    roas: spend > 0 ? revenue / spend : null,
    orders,
    cpa: orders ? spend / orders : null,
    ticket: orders ? revenue / orders : null,
  };
}
export const months = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];
// Valores monetários transcritos da imagem. Impostos e taxas históricos são preservados.
const source = [
  [0, 9.01, 1.25, 0],
  [0, 72.52, 10.03, 0],
  [0, 35.77, 4.95, 0],
  [67.9, 119.19, 16.48, 2.72],
  [135, 77.61, 10.73, 5.4],
  [115.9, 122.17, 16.9, 4.64],
  [267.49, 148.71, 20.57, 10.7],
  [184.47, 164.24, 22.71, 7.38],
  [122.31, 112.01, 15.49, 4.89],
  [179.43, 120.07, 16.61, 7.18],
  [280.89, 162.79, 22.51, 11.24],
  [318.31, 177.33, 24.52, 12.73],
  [259.9, 117.17, 16.2, 10.4],
  [190.2, 146.58, 20.27, 7.61],
  [236.65, 131.84, 18.23, 9.47],
  [313.65, 123.16, 17.03, 12.55],
  [278.26, 109.02, 15.08, 11.13],
  [298.16, 154.97, 21.43, 11.93],
  [477.46, 210.03, 29.05, 19.1],
  [331.31, 176.1, 24.35, 13.25],
  [385.53, 173.23, 23.96, 15.42],
  [256.15, 149.92, 20.73, 10.25],
];
export function initialLedger(): Ledger {
  return {
    version: 1,
    settings: { ...defaults },
    entries: source.map(([revenue, spend, tax, fee], i) => ({
      date: `2026-10-${String(i + 1).padStart(2, "0")}`,
      revenue: revenue!,
      spend: spend!,
      tax: tax!,
      fee: fee!,
      other: 0,
      refunds: 0,
      withdrawal: 0,
      orders: null,
      note: "Importado da planilha enviada em 23/10/2026.",
    })),
  };
}
export function validateLedger(value: unknown): Ledger {
  const v = value as Ledger;
  if (
    !v ||
    v.version !== 1 ||
    !Array.isArray(v.entries) ||
    v.entries.length > 100000 ||
    !v.settings
  )
    throw new Error("Backup inválido. Use um JSON exportado por este painel.");
  const keys = ["revenue", "spend", "tax", "fee", "other", "refunds", "withdrawal"] as const;
  const seen = new Set<string>();
  for (const e of v.entries) {
    if (
      !e ||
      !/^\d{4}-\d{2}-\d{2}$/.test(e.date) ||
      !Number.isFinite(Date.parse(e.date)) ||
      new Date(e.date).toISOString().slice(0, 10) !== e.date ||
      seen.has(e.date)
    )
      throw new Error("Datas inválidas ou duplicadas no backup.");
    seen.add(e.date);
    if (
      keys.some(
        (k) => typeof e[k] !== "number" || !Number.isFinite(e[k]) || e[k] < 0 || e[k] > 1e9,
      ) ||
      (e.orders !== null && (!Number.isInteger(e.orders) || e.orders < 0)) ||
      typeof e.note !== "string"
    )
      throw new Error("Há valores inválidos no backup.");
  }
  if (
    !["spend", "revenue"].includes(v.settings.taxBase) ||
    ![v.settings.taxRate, v.settings.feeRate, v.settings.dailyGoal].every(
      (n) => typeof n === "number" && Number.isFinite(n) && n >= 0,
    ) ||
    v.settings.taxRate > 100 ||
    v.settings.feeRate > 100
  )
    throw new Error("Configurações inválidas.");
  return v;
}
export function exportCSV(entries: Entry[]) {
  const header =
    "Data;Faturamento bruto;Gastos em anúncios;Impostos;Taxas;Outros custos;Reembolsos;Lucro;Retiradas;Pedidos aprovados";
  return (
    "\ufeff" +
    header +
    "\n" +
    [...entries]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((e) =>
        [
          e.date,
          ...[
            e.revenue,
            e.spend,
            e.tax,
            e.fee,
            e.other,
            e.refunds,
            result(e).profit,
            e.withdrawal,
          ].map((n) => n.toFixed(2).replace(".", ",")),
          e.orders ?? "",
        ].join(";"),
      )
      .join("\n")
  );
}
