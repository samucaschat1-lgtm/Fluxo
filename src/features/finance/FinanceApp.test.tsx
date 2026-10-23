import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within, cleanup } from '@testing-library/react';
import { FinanceApp } from './FinanceApp';
vi.mock('recharts',()=>({ ResponsiveContainer:()=>null, Area:()=>null, AreaChart:()=>null, Bar:()=>null, BarChart:()=>null, CartesianGrid:()=>null, Tooltip:()=>null, XAxis:()=>null, YAxis:()=>null, ReferenceLine:()=>null }));
beforeEach(()=>localStorage.clear()); afterEach(cleanup);
describe('Fluxos financeiros',()=>{
 it('salva um lançamento com taxas calculadas, preserva em reload e navega meses vazios',()=>{
  const rendered=render(<FinanceApp/>);
  fireEvent.click(screen.getByRole('button',{name:'Novo lançamento'}));
  const d=within(screen.getByRole('dialog',{name:'Lançamento diário'}));
  fireEvent.change(d.getByLabelText('Data',{exact:true}),{target:{value:'2026-10-23'}});
  fireEvent.change(d.getByLabelText('Faturamento bruto (R$)'),{target:{value:'100'}});
  fireEvent.change(d.getByLabelText('Gastos em anúncios (R$)'),{target:{value:'30'}});
  fireEvent.click(d.getByRole('button',{name:/Calcular impostos/}));
  expect(d.getByLabelText('Impostos / encargos (R$)')).toHaveValue(4.15);
  expect(d.getByLabelText('Taxas do checkout (R$)')).toHaveValue(4);
  fireEvent.click(d.getByRole('button',{name:'Salvar lançamento'}));
  expect(screen.getByText('23 dias registrados')).toBeInTheDocument();
  const stored=JSON.parse(localStorage.getItem('fluxo-financeiro-v1')!);expect(stored.entries.at(-1).revenue).toBe(100);
  rendered.unmount();render(<FinanceApp/>);expect(screen.getByText('23 dias registrados')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'Visão anual'}));
  fireEvent.click(screen.getByRole('button',{name:'Janeiro'}));expect(screen.getByText('Um período para começar.')).toBeInTheDocument();
 });
 it('edita e exclui registros, altera meta sem recalcular o histórico',()=>{
  vi.spyOn(window,'confirm').mockReturnValue(true);render(<FinanceApp/>);
  fireEvent.click(screen.getByRole('button',{name:'Editar dia 01'}));
  const d=within(screen.getByRole('dialog',{name:'Lançamento diário'}));
  fireEvent.change(d.getByLabelText('Faturamento bruto (R$)'),{target:{value:'55'}});
  fireEvent.click(d.getByRole('button',{name:'Salvar lançamento'}));
  expect(JSON.parse(localStorage.getItem('fluxo-financeiro-v1')!).entries.find((e:any)=>e.date==='2026-10-01').revenue).toBe(55);
  fireEvent.click(screen.getByRole('button',{name:'Editar dia 01'}));fireEvent.click(screen.getByRole('button',{name:'Excluir'}));
  expect(screen.getByText('21 dias registrados')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'Configurações'}));
  fireEvent.change(screen.getByLabelText('Meta de lucro por dia (R$)'),{target:{value:'300'}});
  fireEvent.click(screen.getByRole('button',{name:'Salvar configurações'}));
  const stored=JSON.parse(localStorage.getItem('fluxo-financeiro-v1')!);expect(stored.settings.dailyGoal).toBe(300);expect(stored.entries[0].tax).toBe(10.03);
 });
});
