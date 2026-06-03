import { getDailyLedger } from './src/lib/actions/report.actions.js';

async function main() {
  const ledger = await getDailyLedger(2026, 4);
  console.log("May 2026 ledger total sales:", ledger.reduce((acc, l) => acc + l.sales, 0));
  
  const ledgerJun = await getDailyLedger(2026, 5);
  console.log("June 2026 ledger total sales:", ledgerJun.reduce((acc, l) => acc + l.sales, 0));
}

main().catch(console.error);
