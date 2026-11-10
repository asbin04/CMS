// Live verification of exact user test scenarios for Timesheets & Requirements
const API_URL = 'http://localhost:8080/api/v1';

async function run() {
  console.log('========================================================================');
  console.log('   FULL END-TO-END APPROVAL & STATUS PERSISTENCE VERIFICATION           ');
  console.log('========================================================================\n');

  // Authenticate
  const ceoRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'akshit.ujjain', password: '' }),
  });
  const ceoData = await ceoRes.json();
  const ceoToken = ceoData.data.token;
  console.log(`[AUTH] CEO Logged in: ${ceoData.data.name}`);

  const mdRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'gaurav.tripathy', password: '' }),
  });
  const mdData = await mdRes.json();
  const mdToken = mdData.data.token;
  console.log(`[AUTH] MD Logged in: ${mdData.data.name}`);

  // ========================================================================
  // TIMESHEET SCENARIO 1 - 4: Gaurav Tripathy (Approved -> Pending -> Approved)
  // ========================================================================
  console.log('\n--- TIMESHEET TEST A: Gaurav Tripathy (Approved -> Pending -> Approved) ---');
  const tsCreate1 = await fetch(`${API_URL}/timesheets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${mdToken}` },
    body: JSON.stringify({
      projectId: 'PRJ-002',
      taskId: 'TSK-00126',
      employeeId: 'EMP-004',
      hours: 8.0,
      isBillable: true,
      hourlyRate: 1500,
      notes: 'Timesheet creation test: Approved + Gaurav Tripathy',
      approvalStatus: 'Approved',
      assignedApprover: 'MD – Gaurav Tripathy',
      approvedBy: 'Gaurav Tripathy',
      timesheetDate: '2026-11-06',
    }),
  });
  const ts1 = (await tsCreate1.json()).data;
  console.log(`1. Created Timesheet ${ts1.timesheetId}: Status=${ts1.approvalStatus}, ApprovedBy=${ts1.approvedBy}, Assigned=${ts1.assignedApprover}`);
  if (ts1.approvalStatus !== 'Approved' || ts1.approvedBy !== 'Gaurav Tripathy') {
    throw new Error(`TS1 creation mismatch! Status: ${ts1.approvalStatus}, ApprovedBy: ${ts1.approvedBy}`);
  }

  // Change to Pending
  const ts1PatchPending = await fetch(`${API_URL}/timesheets/${ts1.timesheetId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${mdToken}` },
    body: JSON.stringify({ status: 'Pending' }),
  });
  const ts1Pending = (await ts1PatchPending.json()).data;
  console.log(`2. Changed to Pending: Status=${ts1Pending.approvalStatus}, ApprovedBy=${ts1Pending.approvedBy || '-'}, Assigned=${ts1Pending.assignedApprover}`);
  if (ts1Pending.approvalStatus !== 'Pending' || ts1Pending.approvedBy) {
    throw new Error(`TS1 pending mismatch! Status: ${ts1Pending.approvalStatus}, ApprovedBy: ${ts1Pending.approvedBy}`);
  }
  if (!ts1Pending.assignedApprover?.includes('Gaurav')) {
    throw new Error(`TS1 assigned approver lost! Value: ${ts1Pending.assignedApprover}`);
  }

  // Change back to Approved
  const ts1PatchApproved = await fetch(`${API_URL}/timesheets/${ts1.timesheetId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${mdToken}` },
    body: JSON.stringify({ status: 'Approved' }),
  });
  const ts1Approved = (await ts1PatchApproved.json()).data;
  console.log(`3. Changed back to Approved: Status=${ts1Approved.approvalStatus}, ApprovedBy=${ts1Approved.approvedBy}, Assigned=${ts1Approved.assignedApprover}`);
  if (ts1Approved.approvalStatus !== 'Approved' || ts1Approved.approvedBy !== 'Gaurav Tripathy') {
    throw new Error(`TS1 re-approval mismatch! Expected "Gaurav Tripathy", got "${ts1Approved.approvedBy}"`);
  }

  // ========================================================================
  // TIMESHEET SCENARIO 5: Akshit Ujjain (Approved -> Pending -> Approved)
  // ========================================================================
  console.log('\n--- TIMESHEET TEST B: Akshit Ujjain (Approved -> Pending -> Approved) ---');
  const tsCreate2 = await fetch(`${API_URL}/timesheets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ceoToken}` },
    body: JSON.stringify({
      projectId: 'PRJ-002',
      taskId: 'TSK-00126',
      employeeId: 'EMP-004',
      hours: 7.0,
      isBillable: true,
      hourlyRate: 1500,
      notes: 'Timesheet creation test: Approved + Akshit Ujjain',
      approvalStatus: 'Approved',
      assignedApprover: 'CEO – Akshit Ujjain',
      approvedBy: 'Akshit Ujjain',
      timesheetDate: '2026-11-06',
    }),
  });
  const ts2 = (await tsCreate2.json()).data;
  console.log(`1. Created Timesheet ${ts2.timesheetId}: Status=${ts2.approvalStatus}, ApprovedBy=${ts2.approvedBy}, Assigned=${ts2.assignedApprover}`);
  if (ts2.approvalStatus !== 'Approved' || ts2.approvedBy !== 'Akshit Ujjain') {
    throw new Error(`TS2 creation mismatch! Status: ${ts2.approvalStatus}, ApprovedBy: ${ts2.approvedBy}`);
  }

  // Change to Pending
  const ts2PatchPending = await fetch(`${API_URL}/timesheets/${ts2.timesheetId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ceoToken}` },
    body: JSON.stringify({ status: 'Pending' }),
  });
  const ts2Pending = (await ts2PatchPending.json()).data;
  console.log(`2. Changed to Pending: Status=${ts2Pending.approvalStatus}, ApprovedBy=${ts2Pending.approvedBy || '-'}`);
  if (ts2Pending.approvalStatus !== 'Pending' || ts2Pending.approvedBy) {
    throw new Error(`TS2 pending mismatch!`);
  }

  // Change back to Approved
  const ts2PatchApproved = await fetch(`${API_URL}/timesheets/${ts2.timesheetId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ceoToken}` },
    body: JSON.stringify({ status: 'Approved' }),
  });
  const ts2Approved = (await ts2PatchApproved.json()).data;
  console.log(`3. Changed back to Approved: Status=${ts2Approved.approvalStatus}, ApprovedBy=${ts2Approved.approvedBy}`);
  if (ts2Approved.approvalStatus !== 'Approved' || ts2Approved.approvedBy !== 'Akshit Ujjain') {
    throw new Error(`TS2 re-approval mismatch! Expected "Akshit Ujjain", got "${ts2Approved.approvedBy}"`);
  }

  // ========================================================================
  // TIMESHEET SCENARIO 6: Create directly with Pending
  // ========================================================================
  console.log('\n--- TIMESHEET TEST C: Directly with Pending ---');
  const tsCreate3 = await fetch(`${API_URL}/timesheets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${mdToken}` },
    body: JSON.stringify({
      projectId: 'PRJ-002',
      taskId: 'TSK-00126',
      employeeId: 'EMP-004',
      hours: 4.5,
      isBillable: true,
      hourlyRate: 1500,
      notes: 'Timesheet creation test: Direct Pending with Gaurav Tripathy designated',
      approvalStatus: 'Pending',
      assignedApprover: 'MD – Gaurav Tripathy',
      timesheetDate: '2026-11-06',
    }),
  });
  const ts3 = (await tsCreate3.json()).data;
  console.log(`1. Created Timesheet ${ts3.timesheetId}: Status=${ts3.approvalStatus}, ApprovedBy=${ts3.approvedBy || '-'}, Assigned=${ts3.assignedApprover}`);
  if (ts3.approvalStatus !== 'Pending' || ts3.approvedBy) {
    throw new Error(`TS3 direct pending mismatch! Status: ${ts3.approvalStatus}, ApprovedBy: ${ts3.approvedBy}`);
  }

  // ========================================================================
  // REQUIREMENT SCENARIO 1 - 4: Gaurav Tripathy (Completed -> In Progress -> Completed)
  // ========================================================================
  console.log('\n--- REQUIREMENT TEST A: Gaurav Tripathy (Completed -> In Progress -> Completed) ---');
  const reqCreate1 = await fetch(`${API_URL}/requirements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${mdToken}` },
    body: JSON.stringify({
      projectId: 'PRJ-002',
      title: 'Req Test: Completed + Gaurav Tripathy',
      description: 'Requirement created with Completed status',
      type: 'Feature',
      status: 'Completed',
      assignedApprover: 'MD – Gaurav Tripathy',
      ownerId: 'EMP-004',
      targetRelease: 'v2.4',
    }),
  });
  const req1 = (await reqCreate1.json()).data;
  console.log(`1. Created Requirement ${req1.requirementId}: Status=${req1.status}, ApprovedBy=${req1.approvedBy}, Assigned=${req1.assignedApprover}`);
  if (req1.status !== 'Completed' || req1.approvedBy !== 'Gaurav Tripathy') {
    throw new Error(`Req1 creation mismatch! Status: ${req1.status}, ApprovedBy: ${req1.approvedBy}`);
  }

  // Change to In Progress
  const req1PatchInProgress = await fetch(`${API_URL}/requirements/${req1.requirementId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${mdToken}` },
    body: JSON.stringify({ status: 'In Progress' }),
  });
  const req1InProgress = (await req1PatchInProgress.json()).data;
  console.log(`2. Changed to In Progress: Status=${req1InProgress.status}, ApprovedBy=${req1InProgress.approvedBy || '-'}, Assigned=${req1InProgress.assignedApprover}`);
  if (req1InProgress.status !== 'In Progress' || req1InProgress.approvedBy) {
    throw new Error(`Req1 in progress mismatch! Status: ${req1InProgress.status}, ApprovedBy: ${req1InProgress.approvedBy}`);
  }
  if (!req1InProgress.assignedApprover?.includes('Gaurav')) {
    throw new Error(`Req1 assigned approver lost! Value: ${req1InProgress.assignedApprover}`);
  }

  // Change back to Completed
  const req1PatchCompleted = await fetch(`${API_URL}/requirements/${req1.requirementId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${mdToken}` },
    body: JSON.stringify({ status: 'Completed' }),
  });
  const req1Completed = (await req1PatchCompleted.json()).data;
  console.log(`3. Changed back to Completed: Status=${req1Completed.status}, ApprovedBy=${req1Completed.approvedBy}, Assigned=${req1Completed.assignedApprover}`);
  if (req1Completed.status !== 'Completed' || req1Completed.approvedBy !== 'Gaurav Tripathy') {
    throw new Error(`Req1 re-completion mismatch! Expected "Gaurav Tripathy", got "${req1Completed.approvedBy}"`);
  }

  // ========================================================================
  // REQUIREMENT SCENARIO 5: Akshit Ujjain (Completed -> In Progress -> Completed)
  // ========================================================================
  console.log('\n--- REQUIREMENT TEST B: Akshit Ujjain (Completed -> In Progress -> Completed) ---');
  const reqCreate2 = await fetch(`${API_URL}/requirements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ceoToken}` },
    body: JSON.stringify({
      projectId: 'PRJ-002',
      title: 'Req Test: Completed + Akshit Ujjain',
      description: 'Requirement created with Completed status',
      type: 'Feature',
      status: 'Completed',
      assignedApprover: 'CEO – Akshit Ujjain',
      ownerId: 'EMP-004',
      targetRelease: 'v2.4',
    }),
  });
  const req2 = (await reqCreate2.json()).data;
  console.log(`1. Created Requirement ${req2.requirementId}: Status=${req2.status}, ApprovedBy=${req2.approvedBy}, Assigned=${req2.assignedApprover}`);
  if (req2.status !== 'Completed' || req2.approvedBy !== 'Akshit Ujjain') {
    throw new Error(`Req2 creation mismatch! Status: ${req2.status}, ApprovedBy: ${req2.approvedBy}`);
  }

  // Change to In Progress
  const req2PatchInProgress = await fetch(`${API_URL}/requirements/${req2.requirementId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ceoToken}` },
    body: JSON.stringify({ status: 'In Progress' }),
  });
  const req2InProgress = (await req2PatchInProgress.json()).data;
  console.log(`2. Changed to In Progress: Status=${req2InProgress.status}, ApprovedBy=${req2InProgress.approvedBy || '-'}`);
  if (req2InProgress.status !== 'In Progress' || req2InProgress.approvedBy) {
    throw new Error(`Req2 in progress mismatch!`);
  }

  // Change back to Completed
  const req2PatchCompleted = await fetch(`${API_URL}/requirements/${req2.requirementId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ceoToken}` },
    body: JSON.stringify({ status: 'Completed' }),
  });
  const req2Completed = (await req2PatchCompleted.json()).data;
  console.log(`3. Changed back to Completed: Status=${req2Completed.status}, ApprovedBy=${req2Completed.approvedBy}`);
  if (req2Completed.status !== 'Completed' || req2Completed.approvedBy !== 'Akshit Ujjain') {
    throw new Error(`Req2 re-completion mismatch! Expected "Akshit Ujjain", got "${req2Completed.approvedBy}"`);
  }

  // ========================================================================
  // REQUIREMENT SCENARIO 6: Create directly with In Progress
  // ========================================================================
  console.log('\n--- REQUIREMENT TEST C: Directly with In Progress ---');
  const reqCreate3 = await fetch(`${API_URL}/requirements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${mdToken}` },
    body: JSON.stringify({
      projectId: 'PRJ-002',
      title: 'Req Test: Direct In Progress with Gaurav Tripathy designated',
      description: 'Requirement created with In Progress status',
      type: 'Feature',
      status: 'In Progress',
      assignedApprover: 'MD – Gaurav Tripathy',
      ownerId: 'EMP-004',
      targetRelease: 'v2.4',
    }),
  });
  const req3 = (await reqCreate3.json()).data;
  console.log(`1. Created Requirement ${req3.requirementId}: Status=${req3.status}, ApprovedBy=${req3.approvedBy || '-'}, Assigned=${req3.assignedApprover}`);
  if (req3.status !== 'In Progress' || req3.approvedBy) {
    throw new Error(`Req3 direct in progress mismatch! Status: ${req3.status}, ApprovedBy: ${req3.approvedBy}`);
  }

  // ========================================================================
  // REFRESH VERIFICATION (DIRECT GET CALLS TO DATABASE)
  // ========================================================================
  console.log('\n--- REFRESH SIMULATION: Database & GET API Verification ---');
  const getTs = await fetch(`${API_URL}/timesheets`, { headers: { Authorization: `Bearer ${ceoToken}` } });
  const tsList = (await getTs.json()).data.content;
  const fTs1 = tsList.find(t => t.timesheetId === ts1.timesheetId);
  const fTs2 = tsList.find(t => t.timesheetId === ts2.timesheetId);
  const fTs3 = tsList.find(t => t.timesheetId === ts3.timesheetId);

  console.log(`[DB/GET] TS1 (${ts1.timesheetId}): Status=${fTs1.approvalStatus}, ApprovedBy=${fTs1.approvedBy}, AssignedApprover=${fTs1.assignedApprover}`);
  console.log(`[DB/GET] TS2 (${ts2.timesheetId}): Status=${fTs2.approvalStatus}, ApprovedBy=${fTs2.approvedBy}, AssignedApprover=${fTs2.assignedApprover}`);
  console.log(`[DB/GET] TS3 (${ts3.timesheetId}): Status=${fTs3.approvalStatus}, ApprovedBy=${fTs3.approvedBy || '-'}, AssignedApprover=${fTs3.assignedApprover}`);

  if (fTs1.approvedBy !== 'Gaurav Tripathy' || fTs1.approvalStatus !== 'Approved') throw new Error('TS1 GET verification failed!');
  if (fTs2.approvedBy !== 'Akshit Ujjain' || fTs2.approvalStatus !== 'Approved') throw new Error('TS2 GET verification failed!');
  if (fTs3.approvedBy || fTs3.approvalStatus !== 'Pending') throw new Error('TS3 GET verification failed!');

  const getReq = await fetch(`${API_URL}/requirements`, { headers: { Authorization: `Bearer ${ceoToken}` } });
  const reqList = (await getReq.json()).data.content;
  const fReq1 = reqList.find(r => r.requirementId === req1.requirementId);
  const fReq2 = reqList.find(r => r.requirementId === req2.requirementId);
  const fReq3 = reqList.find(r => r.requirementId === req3.requirementId);

  console.log(`[DB/GET] Req1 (${req1.requirementId}): Status=${fReq1.status}, ApprovedBy=${fReq1.approvedBy}, AssignedApprover=${fReq1.assignedApprover}`);
  console.log(`[DB/GET] Req2 (${req2.requirementId}): Status=${fReq2.status}, ApprovedBy=${fReq2.approvedBy}, AssignedApprover=${fReq2.assignedApprover}`);
  console.log(`[DB/GET] Req3 (${req3.requirementId}): Status=${fReq3.status}, ApprovedBy=${fReq3.approvedBy || '-'}, AssignedApprover=${fReq3.assignedApprover}`);

  if (fReq1.approvedBy !== 'Gaurav Tripathy' || fReq1.status !== 'Completed') throw new Error('Req1 GET verification failed!');
  if (fReq2.approvedBy !== 'Akshit Ujjain' || fReq2.status !== 'Completed') throw new Error('Req2 GET verification failed!');
  if (fReq3.approvedBy || fReq3.status !== 'In Progress') throw new Error('Req3 GET verification failed!');

  console.log('\n========================================================================');
  console.log('✅ ALL 12 USER TEST SCENARIOS PASSED WITH PERFECT PERSISTENCE!          ');
  console.log('========================================================================\n');
}

run().catch(err => {
  console.error('\n❌ E2E VERIFICATION FAILED:', err);
  process.exit(1);
});
