import { describe, it, expect } from "vitest";
import { initialLedger, totals, result, validateLedger, exportCSV } from "./model";
describe("Financeiro em centavos", () => {
  it("reconcilia faturamento menos cada custo sem descontar retiradas no lucro", () => {
    const e = {
      ...initialLedger().entries[0]!,
      revenue: 100,
      spend: 30,
      tax: 4,
      fee: 4,
      other: 2,
      refunds: 10,
      withdrawal: 20,
      orders: 2,
    };
    expect(result(e).profit).toBe(50);
    expect(totals([e])).toMatchObject({
      profit: 50,
      balance: 30,
      margin: 50,
      roi: 125,
      roas: 100 / 30,
      cpa: 15,
      ticket: 50,
    });
  });
  it("não inventa CPA nem ticket quando a contagem está ausente", () => {
    expect(totals(initialLedger().entries).cpa).toBeNull();
    expect(totals([]).roi).toBeNull();
    expect(totals([]).roas).toBeNull();
  });
  it("transcreve 22 dias e calcula em centavos", () => {
    const data = initialLedger();
    expect(data.entries).toHaveLength(22);
    expect(result(data.entries[3]!).profit).toBe(-70.49);
    expect(result(data.entries[18]!).profit).toBe(219.28);
    expect(totals(data.entries).profit).toBe(1308.46);
  });
  it("valida restauração e rejeita datas duplicadas, inválidas e números corrompidos", () => {
    const data = initialLedger();
    expect(validateLedger(JSON.parse(JSON.stringify(data)))).toEqual(data);
    expect(() =>
      validateLedger({ ...data, entries: [data.entries[0], data.entries[0]] }),
    ).toThrow();
    expect(() =>
      validateLedger({ ...data, entries: [{ ...data.entries[0], date: "2026-02-30" }] }),
    ).toThrow();
    expect(() =>
      validateLedger({ ...data, entries: [{ ...data.entries[0], revenue: -1 }] }),
    ).toThrow();
  });
  it("exporta CSV em formato brasileiro com contagem desconhecida vazia", () => {
    const csv = exportCSV(initialLedger().entries);
    expect(csv).toContain("2026-10-01;0,00;9,01;1,25;0,00;0,00;0,00;-10,26;0,00;");
  });
});
