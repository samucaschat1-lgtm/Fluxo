import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { money, round, totals } from "./model";
import type { Entry } from "./model";
export function CashModal({
  mode,
  entries,
  fallbackDate,
  close,
  save,
}: {
  mode: "balance" | "withdrawal";
  entries: Entry[];
  fallbackDate: string;
  close: () => void;
  save: (e: Entry) => void;
}) {
  const [date, setDate] = useState(entries.at(-1)?.date ?? fallbackDate);
  const existing = entries.find((e) => e.date === date);
  const total = totals(entries);
  const [amount, setAmount] = useState(
    mode === "balance" ? total.balance : (existing?.withdrawal ?? 0),
  );
  const [note, setNote] = useState("");
  const adjustment = mode === "balance" ? round(amount - total.balance) : 0;
  const newBalance =
    mode === "balance" ? amount : round(total.balance + (existing?.withdrawal ?? 0) - amount);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [close]);
  return (
    <div className="modal-backdrop">
      <form
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={mode === "balance" ? "Editar saldo" : "Editar retirada"}
        onSubmit={(event) => {
          event.preventDefault();
          const base: Entry = existing ?? {
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
          };
          save({
            ...base,
            balanceAdjustment: round((base.balanceAdjustment ?? 0) + adjustment),
            withdrawal: mode === "withdrawal" ? amount : base.withdrawal,
            note: [
              base.note,
              `${mode === "balance" ? "Ajuste de saldo" : "Retirada"}: ${money(mode === "balance" ? adjustment : amount)}. ${note}`,
            ]
              .filter(Boolean)
              .join("\n"),
          });
        }}
      >
        <div className="modal-title">
          <h2>{mode === "balance" ? "Editar saldo após retiradas" : "Editar retirada de lucro"}</h2>
          <button type="button" aria-label="Fechar" onClick={close}>
            <X />
          </button>
        </div>
        <p>
          Período selecionado · saldo atual: <strong>{money(total.balance)}</strong>.
        </p>
        <label>
          Dia do registro
          <select
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              if (mode === "withdrawal")
                setAmount(entries.find((r) => r.date === e.target.value)?.withdrawal ?? 0);
            }}
          >
            {(entries.length ? entries.map((e) => e.date) : [fallbackDate]).map((d) => (
              <option key={d} value={d}>
                {d.split("-").reverse().join("/")}
              </option>
            ))}
          </select>
        </label>
        <label>
          {mode === "balance"
            ? "Saldo desejado após retiradas (R$)"
            : "Total retirado nesse dia (R$)"}
          <input
            autoFocus
            type="number"
            min={mode === "balance" ? -1000000000 : 0}
            max="1000000000"
            step="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </label>
        <p>
          {mode === "balance"
            ? `Será registrado um ajuste de ${money(adjustment)}, sem modificar faturamento ou lucro.`
            : "Este valor substitui o total de retiradas do dia escolhido. Para uma nova retirada, informe o novo total do dia."}
        </p>
        <label>
          Motivo / observação
          <textarea
            maxLength={500}
            required
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ex.: saldo inicial ou retirada para conta pessoal"
          />
        </label>
        <div className="entry-profit">
          Saldo após salvar<strong>{money(newBalance)}</strong>
        </div>
        <div className="modal-actions">
          <button className="secondary" type="button" onClick={close}>
            Cancelar
          </button>
          <button className="primary" type="submit">
            Salvar alteração
          </button>
        </div>
      </form>
    </div>
  );
}
