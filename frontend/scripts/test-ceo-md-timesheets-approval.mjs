// Live verification of CEO and MD approval workflow for Timesheets
const API_URL = 'http://localhost:8080/api/v1';

async function run() {
  console.log('--- 1. Login as CEO (akshit.ujjain) ---');
  const ceoRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'akshit.ujjain', password: '' }),
  });
  const ceoData = await ceoRes.json();
  const ceoToken = ceoData.data.token;
  console.log(`CEO login OK: ${ceoData.data.name} (Role: ${ceoData.data.role})`);

  console.log('\n--- 2. Login as MD (gaurav.tripathy) ---');
  const mdRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'gaurav.tripathy', password: '' }),
  });
  const mdData = await mdRes.json();
  const mdToken = mdData.data.token;
  console.log(`MD login OK: ${mdData.data.name} (Role: ${mdData.data.role})`);

  console.log('\n--- 3. Login as Regular User (EMP-004) ---');
  const userRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'EMP-004', password: '' }),
  });
  const userData = await userRes.json();
  const userToken = userData.data.token;
  console.log(`User login OK: ${userData.data.name} (Role: ${userData.data.role})`);

  console.log('\n--- 4. Create Timesheet with MD assignedApprover ---');
  const createTsRes = await fetch(`${API_URL}/timesheets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userToken}`,
    },
    body: JSON.stringify({
      projectId: 'PRJ-002',
      taskId: 'TSK-00126',
      employeeId: 'EMP-004',
      hours: 7.5,
      isBillable: true,
      billableRate: 1500,
      notes: 'Live MD Timesheet Multi-Approver Verification',
      assignedApprover: 'MD – Gaurav Tripathy',
      timesheetDate: '2026-11-06',
    }),
  });
  const createdTs = await createTsRes.json();
  if (!createdTs.success) {
    throw new Error(`Failed to create timesheet: ${JSON.stringify(createdTs)}`);
  }
  const tsId = createdTs.data.timesheetId;
  console.log(`Created Timesheet: ${tsId}`);
  console.log(`Approval Status: ${createdTs.data.approvalStatus}`);
  console.log(`Assigned Approver: ${createdTs.data.assignedApprover}`);
  console.log(`Approved By: ${createdTs.data.approvedBy ?? '-'}`);
  console.log(`Approved At: ${createdTs.data.approvedAt ?? '-'}`);

  if (createdTs.data.assignedApprover !== 'MD – Gaurav Tripathy') {
    throw new Error('Assigned approver mismatch!');
  }
  if (createdTs.data.approvedBy != null || createdTs.data.approvedAt != null) {
    throw new Error('Approved By and Approved At should be null prior to approval!');
  }

  console.log('\n--- 5. Unauthorized User Attempting Approval (should fail) ---');
  const unauthApproveRes = await fetch(`${API_URL}/timesheets/${tsId}/approve`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${userToken}` },
  });
  console.log(`Unauthorized approval status: ${unauthApproveRes.status} (Expected 403)`);
  if (unauthApproveRes.status !== 403) {
    throw new Error(`Expected 403, got ${unauthApproveRes.status}`);
  }

  console.log('\n--- 6. MD Approving Timesheet ---');
  const mdApproveRes = await fetch(`${API_URL}/timesheets/${tsId}/approve`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${mdToken}` },
  });
  const mdApproveData = await mdApproveRes.json();
  console.log(`MD approve response status: ${mdApproveRes.status}`);
  console.log(`Approved Timesheet status: ${mdApproveData.data.approvalStatus}`);
  console.log(`Approved By: ${mdApproveData.data.approvedBy}`);
  console.log(`Approved At: ${mdApproveData.data.approvedAt}`);

  if (mdApproveData.data.approvedBy !== 'Gaurav Tripathy') {
    throw new Error(`Expected approvedBy to be Gaurav Tripathy, got ${mdApproveData.data.approvedBy}`);
  }

  console.log('\n--- 7. Query GET API to verify persistence across sessions ---');
  const getRes = await fetch(`${API_URL}/timesheets?search=${tsId}`, {
    headers: { Authorization: `Bearer ${ceoToken}` },
  });
  const getData = await getRes.json();
  console.log('getData status:', getRes.status, 'body:', JSON.stringify(getData));
  const fetched = getData.data?.content ? getData.data.content[0] : (getData.data?.data ? getData.data.data[0] : getData.data);
  console.log(`GET fetched timesheet: ${fetched.timesheetId}`);
  console.log(`GET assignedApprover: ${fetched.assignedApprover}`);
  console.log(`GET approvedBy: ${fetched.approvedBy}`);
  console.log(`GET approvalStatus: ${fetched.approvalStatus}`);

  if (fetched.approvedBy !== 'Gaurav Tripathy') {
    throw new Error(`GET API did not return Gaurav Tripathy: ${fetched.approvedBy}`);
  }

  console.log('\n--- 8. Create Timesheet with CEO assignedApprover & Approve as CEO ---');
  const createCeoTsRes = await fetch(`${API_URL}/timesheets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userToken}`,
    },
    body: JSON.stringify({
      projectId: 'PRJ-002',
      taskId: 'TSK-00126',
      employeeId: 'EMP-004',
      hours: 8.0,
      isBillable: true,
      billableRate: 1500,
      notes: 'Live CEO Timesheet Multi-Approver Verification',
      assignedApprover: 'CEO – Akshit Ujjain',
      timesheetDate: '2026-11-06',
    }),
  });
  const createdCeoTs = await createCeoTsRes.json();
  const ceoTsId = createdCeoTs.data.timesheetId;
  console.log(`Created CEO timesheet: ${ceoTsId}`);

  const ceoApproveRes = await fetch(`${API_URL}/timesheets/${ceoTsId}/approve`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${ceoToken}` },
  });
  const ceoApproveData = await ceoApproveRes.json();
  console.log(`CEO approve response: Approved By: ${ceoApproveData.data.approvedBy}, Status: ${ceoApproveData.data.approvalStatus}`);

  if (ceoApproveData.data.approvedBy !== 'Akshit Ujjain') {
    throw new Error(`Expected approvedBy to be Akshit Ujjain, got ${ceoApproveData.data.approvedBy}`);
  }

  console.log('\n--- 9. Submit/Reopen Timesheet and Verify Metadata is Cleared ---');
  const reopenRes = await fetch(`${API_URL}/timesheets/${ceoTsId}/submit`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${ceoToken}` },
  });
  const reopenData = await reopenRes.json();
  console.log(`Reopen response: status=${reopenData.data.approvalStatus}, approvedBy=${reopenData.data.approvedBy ?? '-'}`);

  if (reopenData.data.approvedBy != null || reopenData.data.approvedAt != null) {
    throw new Error('Reopening timesheet should clear approvedBy and approvedAt!');
  }

  console.log('\n✅ ALL TIMESHEETS LIVE VERIFICATION CHECKS PASSED SUCCESSFULLY!');
}

run().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
