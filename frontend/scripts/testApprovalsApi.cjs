async function main() {
  const res = await fetch('http://localhost:5173/api/v1/approvals');
  console.log('GET /api/v1/approvals status:', res.status);
  const data = await res.json();
  console.log('Employees count from DB:', data.employees.length);
  console.log('Clients count from DB:', data.clients.length);
  console.log('Tickets count from DB:', data.ticketsAssets.length);
  console.log('Summary:', data.summary);
}

main().catch(console.error);
