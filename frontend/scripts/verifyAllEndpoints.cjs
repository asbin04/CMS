async function testEndpoint(name, url) {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.log(`❌ ${name}: HTTP ${res.status}`);
      return;
    }
    const data = await res.json();
    let detail = '';
    if (Array.isArray(data)) {
      detail = `${data.length} records in DB`;
    } else if (typeof data === 'object') {
      detail = JSON.stringify(data).slice(0, 80) + '...';
    }
    console.log(`✅ ${name} (${url}) -> HTTP ${res.status} | ${detail}`);
  } catch (err) {
    console.log(`❌ ${name} failed: ${err.message}`);
  }
}

async function main() {
  console.log('=== VERIFYING ALL LIVE DB ENDPOINTS ===\n');
  await testEndpoint('Attendance Records', 'http://localhost:5173/api/v1/attendance');
  await testEndpoint('Attendance Metrics', 'http://localhost:5173/api/v1/attendance/metrics');
  await testEndpoint('Clients List', 'http://localhost:5173/api/v1/clients');
  await testEndpoint('Leads List', 'http://localhost:5173/api/v1/leads');
  await testEndpoint('CEO Dashboard Data', 'http://localhost:5173/api/v1/dashboard/ceo');
  await testEndpoint('Approval Inbox Data', 'http://localhost:5173/api/v1/approvals');
}

main().catch(console.error);
