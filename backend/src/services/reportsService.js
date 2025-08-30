import { parseISO, isSameDay, isSameWeek, isSameMonth } from 'date-fns';
import { listEntries } from './entryService.js';

export async function buildReport({ account, userId, range, from, to }) {
  const entries = await listEntries({ account, userId, filters: { from, to } });
  const totals = { expense: 0, income: 0, investment: 0 };
  const byCategory = {};
  const add = (obj, key, amount) => (obj[key] = (obj[key] || 0) + amount);

  entries.forEach(e => {
    totals[e.type] += e.amount;
    if (e.type === 'expense') add(byCategory, e.category || 'Geral', e.amount);
  });

  let filterFn = () => true;
  const now = new Date();
  if (range === 'daily') filterFn = e => isSameDay(parseISO(e.date), now);
  if (range === 'weekly') filterFn = e => isSameWeek(parseISO(e.date), now, { weekStartsOn: 1 });
  if (range === 'monthly') filterFn = e => isSameMonth(parseISO(e.date), now);

  const rangeEntries = entries.filter(filterFn);

  const summary = {
    count: entries.length,
    totals,
    balance: totals.income - totals.expense,
    byCategory
  };
  const rangeSummary = {
    range,
    count: rangeEntries.length,
    totals: rangeEntries.reduce((acc, e) => { acc[e.type] += e.amount; return acc; }, { expense:0, income:0, investment:0 }),
    balance: rangeEntries.reduce((acc, e) => e.type==='income' ? acc + e.amount : e.type==='expense' ? acc - e.amount : acc, 0)
  };
  return { summary, rangeSummary, entries };
}
