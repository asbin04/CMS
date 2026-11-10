const BASE_URL = 'http://localhost:8080/api/v1';

async function run() {
  console.log('Testing Pending Approvals KPI dynamic updates...');
  
  // 1. Login
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'akshit.ujjain', password: 'password123' })
  });
  const auth = await loginRes.json();
  const token = auth.data.token;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // 2. Fetch current KPIs
  const kpi1 = await (await fetch(`${BASE_URL}/timesheets/kpis`, { headers })).json();
  console.log(`Initial Pending Approvals count: ${kpi1.data.pendingApprovals} (Expected: 2)`);
  if (kpi1.data.pendingApprovals !== 2) {
    throw new Error(`Expected 2 pending approvals, got ${kpi1.data.pendingApprovals}`);
  }

  // 3. Approve one pending timesheet (TS-202611-020)
  console.log('Approving TS-202611-020...');
  const appRes = await fetch(`${BASE_URL}/timesheets/TS-202611-020/approve`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ comments: 'Approved test' })
  });
  console.log(`Approve HTTP status: ${appRes.status}`);

  // 4. Verify KPI drops to 1
  const kpi2 = await (await fetch(`${BASE_URL}/timesheets/kpis`, { headers })).json();
  console.log(`Pending Approvals after approval: ${kpi2.data.pendingApprovals} (Expected: 1)`);
  if (kpi2.data.pendingApprovals !== 1) {
    throw new Error(`Expected 1 pending approval, got ${kpi2.data.pendingApprovals}`);
  }

  // 5. Restore TS-202611-020 back to Pending for the user
  console.log('Restoring TS-202611-020 back to Pending...');
  await fetch(`${BASE_URL}/timesheets/TS-202611-020`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ approvalStatus: 'Pending' })
  });

  // 6. Verify KPI returns to 2
  const kpi3 = await (await fetch(`${BASE_URL}/timesheets/kpis`, { headers })).json();
  console.log(`Pending Approvals after restore: ${kpi3.data.pendingApprovals} (Expected: 2)`);
  if (kpi3.data.pendingApprovals !== 2) {
    throw new Error(`Expected 2 pending approvals, got ${kpi3.data.pendingApprovals}`);
  }

  console.log('✓ ALL PENDING APPROVALS KPI DYNAMIC CHECKS PASSED PERFECTLY!');
}

run().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});

